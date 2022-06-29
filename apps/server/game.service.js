import CONST from "../../definitions/constants.json";
import {RESPONSES} from "./response-codes.js";
import fs from "fs";

export default class GameService {
    constructor(app, fireStoreService) {
        app.post(`${CONST.API_PREFIX}start-game`, async (req, res) => {
            await fireStoreService.startGame()
            res.status(200).send({response: RESPONSES.SUCCESS});
        });

        app.get(`${CONST.API_PREFIX}creatures`, (req, res) => {
            try {
                let data = fs.readFileSync('creatures.json', 'utf8')
                res.status(200).send(data);
            } catch (err) {
                res.status(500).send(err);
            }
        });
    }
}
