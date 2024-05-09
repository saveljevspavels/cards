import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {Logger} from "winston";
import {CONST} from "../../definitions/constants";
import {ChallengeStatType, ProgressiveChallenge} from "../shared/interfaces/progressive-challenge.interface";
import Athlete from "../shared/interfaces/athlete.interface";
import {Activity} from "../shared/interfaces/activity.interface";
import {ChallengeProgress} from "../shared/classes/challenge-progress";
import {StaticValidationService} from "../shared/services/validation.service";
import {RULES} from "../../definitions/rules";

export class ChallengeService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger
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

        app.post(`${CONST.API_PREFIX}/challenges/finish`, async (req, res) => {
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
                await this.finishChallenge(athleteId, req.body.challengeId)
                res.status(200).send({});
            } catch (err) {
                this.logger.error(`Error finishing a challenge ${err}`);
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

    async finishChallenge(athleteId: string, challengeId: string) {
        const [challenge, progress, athlete]: [ProgressiveChallenge | null, ChallengeProgress | null, Athlete | null] = await Promise.all([
            this.fireStoreService.challengeCollection.get(challengeId),
            this.fireStoreService.challengeProgressCollection.get(athleteId),
            this.fireStoreService.athleteCollection.get(athleteId)
        ]);
        if(!challenge || !athlete || !progress) {
            this.logger.error(`Challenge ${challengeId} does not exist`);
            throw `Challenge ${challengeId} does not exist`;
        }
        if(!progress.challengeValues[challengeId]) {
            this.logger.error(`Challenge ${challengeId} is not in progress`);
            throw `Challenge ${challengeId} is not in progress`;
        }
        if(progress.finishedChallenges.indexOf(challengeId) !== -1) {
            this.logger.error(`Challenge ${challengeId} is already finished`);
            throw `Challenge ${challengeId} is already finished`;
        }
        if(progress.completedChallenges.indexOf(challengeId) === -1 || progress.challengeValues[challengeId] < challenge.targetValue) {
            this.logger.error(`Challenge ${challengeId} is not completed yet`);
            throw `Challenge ${challengeId} is not completed yet`;
        }
        await Promise.all([
            this.fireStoreService.challengeProgressCollection.update(athleteId, {
                finishedChallenges: [...progress.finishedChallenges, challengeId]
            }),
            this.fireStoreService.athleteCollection.update(athleteId, {
                experience: parseInt(String(athlete.experience || 0), 10) + parseInt(String(challenge.rewards.experience), 10)
            })
        ]);
        this.logger.info(`Challenge ${challengeId} finished by ${athleteId}`);
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
            .filter(challenge => progress ? progress.finishedChallenges.indexOf(challenge.id) === -1 : true) // Filter out finished challenges
            .filter(challenge => progress ? progress.completedChallenges.indexOf(challenge.id) === -1 : true) // Filter out completed challenges;
            .splice(0, RULES.PROGRESSIVE_CHALLENGE.MAX_ACTIVE); // Limit the number of active challenges
    }
}