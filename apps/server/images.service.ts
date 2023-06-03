import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";

export default class ImageService {
    constructor(app: Express, fireStoreService: FirestoreService) {

        app.post(`${CONST.API_PREFIX}/upload-image`, (req, res) => {
            // fireStoreService.uploadImage()
            res.status(200).send({});
        });

    }
}
