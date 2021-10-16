import CONST from "../../definitions/constants.json";

export default class GameService {
    constructor(app, fireStoreService) {
        app.post(`${CONST.API_PREFIX}start-game`, async (req, res) => {
            await fireStoreService.startGame()
            res.status(200).send({response: CONST.DEFAULT_RESPONSE});
        });
    }
}
