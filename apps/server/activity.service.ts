import {RESPONSES} from "./response-codes";
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";

export default class ActivityService {
    constructor(app: Express, fireStoreService: FirestoreService) {
        app.post(`${CONST.API_PREFIX}submit-activity`, async (req, res) => {
            let response = await fireStoreService.submitActivity(
                req.body.activityId,
                req.body.cards,
                req.body.images,
                req.body.comments
            )
            if(response === RESPONSES.SUCCESS) {
                response = await fireStoreService.tryAutoApprove(req.body.activityId)
            }
            res.status(response === RESPONSES.SUCCESS ? 200 : 400).send({response: response});
        });

        app.post(`${CONST.API_PREFIX}reject-activity`, async (req, res) => {
            await fireStoreService.rejectActivity(req.body.activityId, req.body.comments)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });

        app.post(`${CONST.API_PREFIX}delete-activity`, async (req, res) => {
            await fireStoreService.deleteActivity(req.body.activityId)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });

        app.post(`${CONST.API_PREFIX}approve-activity`, async (req, res) => {
          fireStoreService.approveActivity(req.body.activityId, req.body.cardIds)
          res.status(200).send({response: RESPONSES.SUCCESS});
        });
    }
}
