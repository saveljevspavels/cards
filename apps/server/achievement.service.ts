import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";

export default class AchievementService {
    constructor(app: Express, fireStoreService: FirestoreService) {

        app.post(`${CONST.API_PREFIX}/create-achievement`, async (req, res) => {
            await fireStoreService.createAchievement(req.body)
            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}/delete-achievement`, (req, res) => {
            fireStoreService.deleteAchievement(req.body.achievementId)
            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}/assign-achievement`, async (req, res) => {
            if(await fireStoreService.assignAchievement(req.body.athleteId, req.body.achievementId)) {
                await fireStoreService.updateScore(req.body.athleteId, [])
            }
            res.status(200).send({});
        });
    }
}
