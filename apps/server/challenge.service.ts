import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {Logger} from "winston";
import {CONST} from "../../definitions/constants";
import {ChallengeStatType, ProgressiveChallenge} from "../shared/interfaces/progressive-challenge.interface";
import Athlete from "../shared/interfaces/athlete.interface";
import {Activity} from "../shared/interfaces/activity.interface";
import {ChallengeProgress} from "../shared/classes/challenge-progress";
import {StaticValidationService} from "../shared/services/validation.service";

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
    }

    async createChallenge(challenge: ProgressiveChallenge) {
        await this.fireStoreService.challengeCollection.set(
            challenge.id,
            challenge
        );
        this.logger.info(`New challenge created: ${challenge.title}`);
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

    async getActiveChallenges(progress: ChallengeProgress): Promise<ProgressiveChallenge[]> {
        const game = await this.fireStoreService.gameCollection.get(CONST.GAME_ID);
        return (await this.getAllChallenges())
            .filter(challenge => game ? game.activeChallenges.indexOf(challenge.id) !== -1 : false) // Filter out inactive challenges
            .filter(challenge => progress ? progress.finishedChallenges.indexOf(challenge.id) === -1 : true) // Filter out finished challenges
            .filter(challenge => progress ? progress.completedChallenges.indexOf(challenge.id) === -1 : true); // Filter out completed challenges;
    }
}