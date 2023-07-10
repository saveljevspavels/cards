import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {Logger} from "winston";
import Score from "../shared/interfaces/score.interface";

export default class ScoreService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger
    ) {
    }

    async updateScore(athleteId: string, cardId: string, deduct = false) {
        const score = (await this.fireStoreService.scoreCollection.get(athleteId.toString())) || this.createNewScore(athleteId);
        if(!score) {
            this.logger.info(`Score does not exist for athlete ${athleteId}`);
            return;
        }
        const card = await this.fireStoreService.cardCollection.get(cardId);
        if(!card) {
            this.logger.info(`Can't update score for athlete ${athleteId}, card ${cardId} does not exist`);
            return;
        }
        const newValue: number = parseInt(String(score.value)) + parseInt(String(deduct ? (-card.value) : card.value));
        await this.fireStoreService.scoreCollection.set(
            athleteId.toString(),
            {
                ...score,
                value: newValue,
                cardsPlayed: score.cardsPlayed + 1
            }
        );

        this.logger.info(`Athlete ${athleteId} ${deduct ? 'lost': 'got'} ${card.value} points, new score: ${newValue}, was ${score.value}`)
    }

    async addPoints(athleteId: string, value: number) {
        const score = (await this.fireStoreService.scoreCollection.get(athleteId.toString())) || this.createNewScore(athleteId);
        await this.fireStoreService.scoreCollection.set(
            athleteId.toString(),
            {
                ...score,
                value: score.value + value
            }
        );
        this.logger.info(`Athlete ${athleteId} got ${value} points, new score: ${score.value + value}, was ${score.value}`);
    }

    createNewScore(athleteId: string): Score {
        return {
            athleteId,
            cardsPlayed: 0,
            value: 0,
            activities: 0
        }
    }
}
