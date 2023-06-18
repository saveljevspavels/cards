import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {Logger} from "winston";

export default class ScoreService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger
    ) {
    }

    async updateScore(athleteId: string, cardId: string) {
        const score = await this.fireStoreService.scoreCollection.get(athleteId.toString());
        if(!score) {
            this.logger.info(`Score does not exist for athlete ${athleteId}`);
            return;
        }
        const card = await this.fireStoreService.cardCollection.get(cardId);
        if(!card) {
            this.logger.info(`Can't update score for athlete ${athleteId}, card ${cardId} does not exist`);
            return;
        }
        const newValue: number = parseInt(String(score.value)) + parseInt(String(card.value));
            await this.fireStoreService.scoreCollection.update(
            athleteId.toString(),
            {
                ...score,
                value: newValue
            });

        this.logger.info(`Athlete ${athleteId} got ${card.value} points, new score: ${newValue}, was ${score.value}`)
    }
}
