import CONST from "../../definitions/constants.json";

export default class CardService {
    constructor(app, fireStoreService) {

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
            res.status(response === CONST.DEFAULT_RESPONSE ? 200 : 400).send({response});
        });
    }
}
