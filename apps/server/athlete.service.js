import CONST from "../../definitions/constants.json";
import {RESPONSES} from "./response-codes.js"

export default class AthleteService {
    constructor(app, fireStoreService) {
        app.post(`${CONST.API_PREFIX}update-base-workout`, async (req, res) => {
            if(!req.body.athleteIds.length) {
                res.status(400).send({response: RESPONSES.ERROR.INVALID_ATHLETE});
                return;
            }
            await fireStoreService.updateBaseWorkout(req.body.athleteIds, req.body.baseWorkout)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });

        app.post(`${CONST.API_PREFIX}set-permissions`, async (req, res) => {
            await fireStoreService.setPermissions(req.body.athleteIds, req.body.permissions)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });
    }
}
