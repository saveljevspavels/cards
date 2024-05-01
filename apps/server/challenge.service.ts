import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {Logger} from "winston";
import {CONST} from "../../definitions/constants";
import GameService from "./game.service";
import CardFactory from "../shared/interfaces/card-factory.interface";
import {getRandomInt} from "./helpers/util";
import {RULES} from "../../definitions/rules";
import {ProgressiveChallenge} from "../shared/interfaces/progressive-challenge.interface";

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

}