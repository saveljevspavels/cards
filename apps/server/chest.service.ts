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

export class ChestService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger,
        private athleteService: AthleteService,
    ) {
        app.post(`${CONST.API_PREFIX}/chest/open`,async (req, res) => {
            const token = res.get('accessToken');
            const athleteId = res.get('athleteId');
            if(!token) {
                return;
            }
            if(!athleteId) {
                res.status(400).send('Athlete Id missing');
                return;
            }

            try {
                await this.openChest(athleteId)
                res.status(200).send({});
            } catch (err) {
                this.logger.error(`Error opening a chest ${err}`);
                res.status(500).send({});
            }
        });
    }

    async openChest(athleteId: string) {
        const [athlete]: [Athlete] = await Promise.all([
            this.athleteService.getAthlete(athleteId),
        ]);

        if(athlete.currencies.chests <= 0) {
            this.logger.error(`Athlete ${athlete.name} don't have any chests to open`);
            throw `All chests are already open`;
        }

        const rewards: any[] = [];

        // TODO: implement this
        this.logger.info(`Chest opened for ${athlete.name}, contains: ${rewards}`);
    }
}