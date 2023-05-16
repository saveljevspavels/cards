import {RESPONSES} from "./response-codes";
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";

export default class DeckService {
    constructor(app: Express, fireStoreService: FirestoreService) {

        app.post(`${CONST.API_PREFIX}set-deck`, (req, res) => {
            fireStoreService.setDeck(req.body)
            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}add-to-deck`, async (req, res) => {
            await fireStoreService.addToHand(CONST.HANDS.DECK, req.body)
            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}delete-cards`, (req, res) => {
            fireStoreService.deleteCards(req.body)
            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}shuffle-deck`, (req, res) => {
            fireStoreService.shuffleDeck()
            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}deal-cards`, async (req, res) => {
            const result = await fireStoreService.dealCards(req.body.athletes, req.body.amount)
            if(result) {
                res.status(200).send({response: RESPONSES.SUCCESS});
            } else {
                res.status(400).send({response: 'Not enough cards in deck'});
            }
        });

        app.post(`${CONST.API_PREFIX}deal-queue`, async (req, res) => {
            const result = await fireStoreService.dealQueue()
            if(result) {
                res.status(200).send({response: RESPONSES.SUCCESS});
            } else {
                res.status(400).send({response: 'Not enough cards in deck'});
            }
        });

        app.post(`${CONST.API_PREFIX}discard-cards`, (req, res) => {
            fireStoreService.discardCards(req.body.athleteId, req.body.cardIds)
            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}draw-card`, async (req, res) => {
            const response = await fireStoreService.drawCard(req.body.athleteId)
            res.status(response === RESPONSES.SUCCESS ? 200 : 400).send({response});
        });
    }
}
