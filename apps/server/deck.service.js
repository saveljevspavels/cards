import CONST from "../../definitions/constants.json";

export default class DeckService {
    constructor(app, fireStoreService) {

        app.post(`${CONST.API_PREFIX}set-deck`, (req, res) => {
            fireStoreService.setDeck(req.body)
            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}add-to-deck`, (req, res) => {
            fireStoreService.addToDeck(req.body)
            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}shuffle-deck`, (req, res) => {
            fireStoreService.shuffleDeck()
            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}deal-cards`, async (req, res) => {
            const result = await fireStoreService.dealCards(req.body.athletes, req.body.amount)
            if(result) {
                res.status(200).send({response: CONST.DEFAULT_RESPONSE});
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
            res.status(response === CONST.DEFAULT_RESPONSE ? 200 : 400).send({response});
        });
    }
}
