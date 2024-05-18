import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {Logger} from "winston";
import {CONST} from "../../definitions/constants";
import {ChallengeStatType, ProgressiveChallenge} from "../shared/interfaces/progressive-challenge.interface";
import Athlete from "../shared/classes/athlete.class";
import {Activity} from "../shared/interfaces/activity.interface";
import {ChallengeProgress} from "../shared/classes/challenge-progress";
import {StaticValidationService} from "../shared/services/validation.service";
import {RULES} from "../../definitions/rules";
import AthleteService from "./athlete.service";
import {LEVEL_REWARDS} from "../../definitions/level_rewards";
import ScoreService from "./score.service";

export class ChallengeService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger,
        private athleteService: AthleteService,
        private scoreService: ScoreService
    ) {
        app.post(`${CONST.API_PREFIX}/challenges/create`,async (req, res) => {
            const token = res.get('accessToken');
            if(!token) {
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
            if(!token) {
                return;
            }
            if(!req.body.challengeId || !athleteId) {
                res.status(400).send('Challenge Id or Athlete Id missing');
                return;
            }

            try {
                await this.claimChallenge(athleteId, req.body.challengeId);
                await this.levelUp(athleteId);
                res.status(200).send({});
            } catch (err) {
                this.logger.error(`Error claiming a challenge ${err}`);
                res.status(500).send({});
            }
        });

        app.post(`${CONST.API_PREFIX}/challenges/level/claim`, async (req, res) => {
            const token = res.get('accessToken');
            const athleteId = res.get('athleteId');
            if(!token) {
                return;
            }
            if((!req.body.levelIndex && req.body.levelIndex !== 0) || !athleteId) {
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
        if(athlete?.level < levelIndex + 1) {
            this.logger.error(`Athlete ${athleteId} is not on level ${levelIndex}`);
            throw `Athlete ${athleteId} is not on level ${levelIndex} yet`;
        }
        if(athlete?.claimedLevelRewards?.indexOf(levelIndex) > -1) {
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
            this.fireStoreService.challengeCollection.get(challengeId),
            this.fireStoreService.challengeProgressCollection.get(athleteId),
            this.athleteService.getAthlete(athleteId),
        ]);
        if(!challenge || !athlete || !progress) {
            this.logger.error(`Challenge ${challengeId} does not exist`);
            throw `Challenge ${challengeId} does not exist`;
        }
        if(!progress.challengeValues[challengeId]) {
            this.logger.error(`Challenge ${challengeId} is not in progress`);
            throw `Challenge ${challengeId} is not in progress`;
        }
        if(progress.claimedChallenges.indexOf(challengeId) !== -1) {
            this.logger.error(`Challenge ${challengeId} is already claimed`);
            throw `Challenge ${challengeId} is already claimed`;
        }
        if(progress.completedChallenges.indexOf(challengeId) === -1 || progress.challengeValues[challengeId] < challenge.targetValue) {
            this.logger.error(`Challenge ${challengeId} is not completed yet`);
            throw `Challenge ${challengeId} is not completed yet`;
        }

        athlete.currencies.experience = parseInt(String(athlete.currencies.experience || 0), 10) + parseInt(String(challenge.rewards.experience), 10);

        await Promise.all([
            this.fireStoreService.challengeProgressCollection.update(athleteId, {
                claimedChallenges: [...progress.claimedChallenges, challengeId]
            }),
            this.athleteService.updateAthlete(athlete)
        ]);
        this.logger.info(`Challenge ${challengeId} claimed by ${athleteId}`);
    }

    async levelUp(athleteId: string) {
        const athlete: Athlete = await this.athleteService.getAthlete(athleteId);
        while (athlete.level < LEVEL_REWARDS.length && athlete.currencies.experience >= RULES.LEVEL_EXPERIENCE[athlete.level]) {
            athlete.level++;
            athlete.currencies.experience -= RULES.LEVEL_EXPERIENCE[athlete.level];
        }
        await this.athleteService.updateAthlete(athlete);
        this.logger.info(`Athlete ${athlete.name} leveled up to ${athlete.level}`);
    }

    async getAllChallenges(): Promise<ProgressiveChallenge[]> {
        return await this.fireStoreService.challengeCollection.all();
    }

    async evaluateChallengeProgress(activity: Activity, athlete: Athlete) {
        const rawProgress = await this.fireStoreService.challengeProgressCollection.get(athlete.id);
        const progress: ChallengeProgress = rawProgress ? ChallengeProgress.fromJSONObject(rawProgress) : new ChallengeProgress(athlete.id);
        const challenges = await this.getActiveChallenges(progress);
        challenges.forEach(challenge => {
            this.progressChallenge(activity, challenge, progress);
        });
        challenges.forEach(challenge => {
            this.completeApplicableChallenge(challenge, progress);
        });
        await this.fireStoreService.challengeProgressCollection.set(athlete.id, progress);
    }

    progressChallenge(activity: Activity, challenge: ProgressiveChallenge, progress: ChallengeProgress): ChallengeProgress {
        if(challenge.activityType && challenge.activityType !== StaticValidationService.normalizeActivityType(activity)) {
            return progress; // Incompatible activity type for this challenge
        }

        switch(challenge.stat) {
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
            case ChallengeStatType.HEARTBEATS:
                if(!activity.average_heartrate || activity.average_heartrate < 100) {
                    break
                }
                progress.progressChallenge(challenge.id, (activity.average_heartrate) * activity.elapsed_time);
                break;
        }

        return progress;
    }

    completeApplicableChallenge(challenge: ProgressiveChallenge, progress: ChallengeProgress): ChallengeProgress {
        const currentValue = progress.challengeValues[challenge.id] || 0;
        if(currentValue >= challenge.targetValue) {
            progress.completeChallenge(challenge.id);
        }
        return progress;
    }

    async getActiveChallenges(progress: ChallengeProgress): Promise<ProgressiveChallenge[]> {
        const game = await this.fireStoreService.gameCollection.get(CONST.GAME_ID);
        return (await this.getAllChallenges())
            .filter(challenge => game ? game.activeChallenges.indexOf(challenge.id) !== -1 : false) // Filter out inactive challenges
            .filter(challenge => progress ? progress.claimedChallenges.indexOf(challenge.id) === -1 : true) // Filter out claimed challenges
            .filter(challenge => progress ? progress.completedChallenges.indexOf(challenge.id) === -1 : true) // Filter out completed challenges;
            .splice(0, RULES.PROGRESSIVE_CHALLENGE.MAX_ACTIVE); // Limit the number of active challenges
    }
}