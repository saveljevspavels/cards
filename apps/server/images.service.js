import https from "https";
import CONST from "../../definitions/constants.json";

export default class ImageService {
    constructor(app, fireStoreService) {

        app.post(`${CONST.API_PREFIX}upload-image`, (req, res) => {
            console.log('upload', req)
            // fireStoreService.uploadImage()
            res.status(200).send({});
        });

    }
}
