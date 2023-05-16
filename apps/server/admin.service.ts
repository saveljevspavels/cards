import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";

export default class AdminService {
    constructor(app: Express, fireStoreService: FirestoreService) {

        app.post(`${CONST.API_PREFIX}admin/commands`, (req, res) => {
            const athleteIds = req?.body?.athleteIds
            if(athleteIds) {
                athleteIds.forEach(((id: string) => {
                    fireStoreService.addCommand(id, {
                        ...req?.body?.command
                    });
                }))
            }
            res.status(200).send({});
        });

    }
}
