import CONST from "../../definitions/constants.json";
import {RESPONSES} from "./response-codes.js";

export default class GameService {
    constructor(app, fireStoreService) {
        app.post(`${CONST.API_PREFIX}start-game`, async (req, res) => {
            await fireStoreService.startGame()
            res.status(200).send({response: RESPONSES.SUCCESS});
        });
    }
}
