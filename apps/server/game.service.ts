import {RESPONSES} from "./response-codes";
import fs from "fs";
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";

export default class GameService {
    constructor(app: Express, fireStoreService: FirestoreService) {
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
