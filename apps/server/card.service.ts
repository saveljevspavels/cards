import {RESPONSES} from "./response-codes";
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";

export default class CardService {
    constructor(app: Express, fireStoreService: FirestoreService) {

        app.post(`${CONST.API_PREFIX}create-card-factory`, (req, res) => {
            fireStoreService.createCardFactory(req.body)
            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}create-card-instances`, (req, res) => {
            fireStoreService.createCardInstances(req.body.tier, req.body.amount, req.body.cardFactoryIds)
            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}combine-cards`, async (req, res) => {
            const response = await fireStoreService.combineCards(req.body.athleteId, req.body.cardIds)
            res.status(response === RESPONSES.SUCCESS ? 200 : 400).send({response});
        });
    }
}
