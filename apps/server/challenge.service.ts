import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {Logger} from "winston";
import {CONST} from "../../definitions/constants";
import {
    ChallengeStatTagMap,
    ChallengeStatType,
    ProgressiveChallenge
} from "../shared/interfaces/progressive-challenge.interface";
import Athlete from "../shared/classes/athlete.class";
import {Activity} from "../shared/interfaces/activity.interface";
import {ChallengeProgress} from "../shared/classes/challenge-progress";
import {StaticValidationService} from "../shared/services/validation.service";
import {RULES} from "../../definitions/rules";
import AthleteService from "./athlete.service";
import {LEVEL_REWARDS} from "../../definitions/level_rewards";
import ScoreService from "./score.service";
import {ACHIEVEMENTS} from "../../definitions/achievements";
import {CardSnapshot, CardTag} from "../shared/classes/card.class";

export class ChallengeService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger,
        private athleteService: AthleteService,
        private scoreService: ScoreService
    ) {
        app.post(`${CONST.API_PREFIX}/challenges/create`, async (req, res) => {
            const token = res.get('accessToken');
            if (!token) {
                return;
            }
            try {
                await this.createChallenge(req.body.challenge)
                res.status(200).send({});
            } catch (err) {
                this.logger.error(`Error creating a challenge ${err}`);
                res.status(500).send({});
            }
        });

        app.post(`${CONST.API_PREFIX}/challenges/claim`, async (req, res) => {
            const token = res.get('accessToken');
            const athleteId = res.get('athleteId');
            if (!token) {
                return;
            }
            if (!req.body.challengeId || !athleteId) {
                res.status(400).send('Challenge Id or Athlete Id missing');
                return;
            }

            try {
                await this.claimChallenge(athleteId, req.body.challengeId);
                res.status(200).send({});
            } catch (err) {
                this.logger.error(`Error claiming a challenge ${err}`);
                res.status(500).send({});
            }
        });

        app.post(`${CONST.API_PREFIX}/challenges/level/claim`, async (req, res) => {
            const token = res.get('accessToken');
            const athleteId = res.get('athleteId');
            if (!token) {
                return;
            }
            if ((!req.body.levelIndex && req.body.levelIndex !== 0) || !athleteId) {
                res.status(400).send('Level Index or Athlete Id missing');
                return;
            }

            try {
                await this.claimLevelReward(athleteId, req.body.levelIndex)
                res.status(200).send({});
            } catch (err) {
                this.logger.error(`Error claiming a level reward ${err}`);
                res.status(500).send({});
            }
        });
    }

    async createChallenge(challenge: ProgressiveChallenge) {
        await this.fireStoreService.challengeCollection.set(
            challenge.id,
            challenge
        );
        this.logger.info(`New challenge created: ${challenge.title}`);
    }

    async claimLevelReward(athleteId: string, levelIndex: number) {
        const athlete: Athlete = await this.athleteService.getAthlete(athleteId);
        if (athlete?.level < levelIndex + 1) {
            this.logger.error(`Athlete ${athleteId} is not on level ${levelIndex}`);
            throw `Athlete ${athleteId} is not on level ${levelIndex} yet`;
        }
        if (athlete?.claimedLevelRewards?.indexOf(levelIndex) > -1) {
            this.logger.error(`Athlete ${athleteId} has already claimed level ${levelIndex}`);
            throw `Athlete ${athleteId} has already claimed level ${levelIndex}`;
        }

        athlete.claimLevelRewards(levelIndex);
        await Promise.all([
            LEVEL_REWARDS[levelIndex].points ? this.scoreService.addPoints(athleteId, LEVEL_REWARDS[levelIndex].points) : Promise.resolve(),
            this.athleteService.updateAthlete(athlete)
        ]);
        this.logger.info(`Level ${levelIndex + 1} rewards ${LEVEL_REWARDS[levelIndex]} claimed by ${athlete.name}`);
    }

    async claimChallenge(athleteId: string, challengeId: string) {
        const [challenge, progress, athlete]: [ProgressiveChallenge | null, ChallengeProgress | null, Athlete] = await Promise.all([
            ACHIEVEMENTS.find(challenge => challenge.id === challengeId) || this.fireStoreService.challengeCollection.get(challengeId),
            this.fireStoreService.challengeProgressCollection.get(athleteId),
            this.athleteService.getAthlete(athleteId),
        ]);
        if (!challenge || !athlete || !progress) {
            this.logger.error(`Challenge ${challengeId} does not exist`);
            throw `Challenge ${challengeId} does not exist`;
        }
        if (!progress.challengeValues[challengeId]) {
            this.logger.error(`Challenge ${challengeId} is not in progress`);
            throw `Challenge ${challengeId} is not in progress`;
        }
        if (progress.claimedChallenges.indexOf(challengeId) !== -1) {
            this.logger.error(`Challenge ${challengeId} is already claimed`);
            throw `Challenge ${challengeId} is already claimed`;
        }
        if (progress.completedChallenges.indexOf(challengeId) === -1 || progress.challengeValues[challengeId] < challenge.targetValue) {
            this.logger.error(`Challenge ${challengeId} is not completed yet`);
            throw `Challenge ${challengeId} is not completed yet`;
        }

        this.athleteService.addExperience(athlete, challenge.rewards.experience);


        await Promise.all([
            this.fireStoreService.challengeProgressCollection.update(athleteId, {
                claimedChallenges: [...progress.claimedChallenges, challengeId]
            }),
            challenge.rewards.points ? this.scoreService.addPoints(athleteId, challenge.rewards.points) : Promise.resolve(),
            this.athleteService.updateAthlete(athlete)
        ]);
        this.logger.info(`Challenge ${challengeId} claimed by ${athleteId}`);
    }

    async getAllChallenges(): Promise<ProgressiveChallenge[]> {
        return await this.fireStoreService.challengeCollection.all();
    }

    async evaluateChallengeProgress(activity: Activity, athleteId: string, evaluateImmediate: boolean, baseCardCompletion: number = 0) {
        const progress = await this.getChallengeProgress(athleteId);
        const challenges = (await this.getActiveChallenges(progress)).filter(challenge => challenge.evaluateImmediate === evaluateImmediate);
        challenges.forEach(challenge => {
            this.progressChallenge(activity, challenge, progress, baseCardCompletion);
        });
        challenges.forEach(challenge => {
            this.completeApplicableChallenge(challenge, progress);
        });
        await this.fireStoreService.challengeProgressCollection.set(athleteId, progress);
    }

    async progressCoinChallenge(athleteId: string, coins: number) {
        const progress = await this.getChallengeProgress(athleteId);
        const challenges = (await this.getActiveChallenges(progress))
            .filter(challenge => challenge.stat === ChallengeStatType.STORE_SPENT_COINS);
        if(!challenges.length) {
            return;
        }
        challenges.forEach(challenge => {
            progress.progressChallenge(challenge.id, coins);
        });
        challenges.forEach(challenge => {
            this.completeApplicableChallenge(challenge, progress);
        });
        await this.fireStoreService.challengeProgressCollection.set(athleteId, progress);
    }

    async progressCardUnlockChallenge(athleteId: string) {
        const progress = await this.getChallengeProgress(athleteId);
        const challenges = (await this.getActiveChallenges(progress))
            .filter(challenge => challenge.stat === ChallengeStatType.CARD_UNLOCK);
        if(!challenges.length) {
            return;
        }
        challenges.forEach(challenge => {
            progress.progressChallenge(challenge.id, 1);
        });
        challenges.forEach(challenge => {
            this.completeApplicableChallenge(challenge, progress);
        });
        await this.fireStoreService.challengeProgressCollection.set(athleteId, progress);
    }

    async getChallengeProgress(athleteId: string): Promise<ChallengeProgress> {
        const rawProgress = await this.fireStoreService.challengeProgressCollection.get(athleteId);
        return rawProgress ? ChallengeProgress.fromJSONObject(rawProgress) : new ChallengeProgress(athleteId);
    }

    progressChallenge(activity: Activity, challenge: ProgressiveChallenge, progress: ChallengeProgress, baseCardCompletion: number): ChallengeProgress {
        if (challenge.activityType && challenge.activityType !== StaticValidationService.normalizeActivityType(activity)) {
            return progress; // Incompatible activity type for this challenge
        }

        const cardSnapshots = activity?.gameData?.cardSnapshots || [];

        switch (challenge.stat) {
            case ChallengeStatType.DISTANCE:
                progress.progressChallenge(challenge.id, activity.distance);
                break;
            case ChallengeStatType.ELEVATION_GAIN:
                progress.progressChallenge(challenge.id, activity.total_elevation_gain);
                break;
            case ChallengeStatType.MOVING_TIME:
                progress.progressChallenge(challenge.id, activity.moving_time);
                break;
            case ChallengeStatType.ELAPSED_TIME:
                progress.progressChallenge(challenge.id, activity.elapsed_time);
                break;
            case ChallengeStatType.WANDERER_TASKS:
                progress.progressChallenge(challenge.id, this.countApplicableCards(cardSnapshots, ChallengeStatType.WANDERER_TASKS));
                break;
            case ChallengeStatType.PHOTOHUNTER_TASKS:
                progress.progressChallenge(challenge.id, this.countApplicableCards(cardSnapshots, ChallengeStatType.PHOTOHUNTER_TASKS));
                break;
            case ChallengeStatType.MULTITASKER_TASKS:
                progress.progressChallenge(challenge.id, this.countApplicableCards(cardSnapshots, ChallengeStatType.MULTITASKER_TASKS));
                break;
            case ChallengeStatType.HARDWORKER_TASKS:
                progress.progressChallenge(challenge.id, this.countApplicableCards(cardSnapshots, ChallengeStatType.HARDWORKER_TASKS));
                break;
            case ChallengeStatType.DAILY_COMPLETED_TASKS:
            case ChallengeStatType.COMPLETED_TASKS:
                progress.progressChallenge(challenge.id, cardSnapshots.length);
                break;
            case ChallengeStatType.BASIC_TASKS:
                progress.progressChallenge(challenge.id, baseCardCompletion);
                break;
            case ChallengeStatType.ACTIVITY_COUNT:
                if(activity.elapsed_time >= RULES.PROGRESSIVE_CHALLENGE.MIN_ACTIVITY_TIME) {
                    progress.progressChallenge(challenge.id, 1);
                }
                break;
            case ChallengeStatType.HEARTBEATS:
                const avgHeartRate = activity.average_heartrate || 60;
                progress.progressChallenge(challenge.id, Math.floor((avgHeartRate) * (activity.elapsed_time / 60)));
                break;
        }

        return progress;
    }

    completeApplicableChallenge(challenge: ProgressiveChallenge, progress: ChallengeProgress): ChallengeProgress {
        const currentValue = progress.challengeValues[challenge.id] || 0;
        if (currentValue >= challenge.targetValue) {
            progress.completeChallenge(challenge.id);
        }
        return progress;
    }

    async resetDailyChallenges(athleteId: string) {
        const progress = await this.getChallengeProgress(athleteId);
        const challenges = await this.getActiveChallenges(progress);

        challenges.filter(challenge => challenge.stat.indexOf('DAILY') !== -1).forEach(
            challenge => progress.resetChallenge(challenge.id)
        );
        await this.fireStoreService.challengeProgressCollection.set(athleteId, progress);
    }

    async getActiveChallenges(progress: ChallengeProgress): Promise<ProgressiveChallenge[]> {
        const game = await this.fireStoreService.gameCollection.get(CONST.GAME_ID);
        return [
            ...this.filterFinishedChallenges(
                (await this.getAllChallenges())
                    .filter(challenge => game ? game.activeChallenges.indexOf(challenge.id) !== -1 : false), // Filter out inactive challenges
                progress
            ).splice(0, RULES.PROGRESSIVE_CHALLENGE.MAX_ACTIVE), // Limit the number of active challenges
            // ...this.filterFinishedChallenges(ACHIEVEMENTS, progress)
        ];
    }

    filterFinishedChallenges(challenges: ProgressiveChallenge[], progress: ChallengeProgress): ProgressiveChallenge[] {
        return challenges
            .filter(challenge => progress ? progress.claimedChallenges.indexOf(challenge.id) === -1 : true) // Filter out claimed challenges
            .filter(challenge => progress ? progress.completedChallenges.indexOf(challenge.id) === -1 : true) // Filter out completed challenges;
    }

    countApplicableCards(cardSnapshots: CardSnapshot[], stat: ChallengeStatType): number {
        if (!cardSnapshots.length) {
            return 0;
        }
        const tag: CardTag = ChallengeStatTagMap.get(stat) || CardTag.unknown;
        return cardSnapshots.filter(snapshot => (snapshot.tags || []).indexOf(tag) !== -1).length;
    }
}