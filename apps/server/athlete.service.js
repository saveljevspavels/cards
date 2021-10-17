import CONST from "../../definitions/constants.json";
import {RESPONSES} from "./response-codes.js"

export default class AthleteService {
    constructor(app, fireStoreService) {
        app.post(`${CONST.API_PREFIX}set-divisions`, async (req, res) => {
            await fireStoreService.setDivisions(req.body.athleteIds, req.body.divisions)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });

        app.post(`${CONST.API_PREFIX}set-permissions`, async (req, res) => {
            await fireStoreService.setPermissions(req.body.athleteIds, req.body.permissions)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });
    }
}
