import CONST from "../../definitions/constants.json";

export default class ActivityService {
    constructor(app, fireStoreService) {
        app.post(`${CONST.API_PREFIX}submit-activity`, async (req, res) => {
            fireStoreService.submitActivity(
                req.body.activityId,
                req.body.cards,
                req.body.images,
                req.body.comments
            )
            res.status(200).send({response: CONST.DEFAULT_RESPONSE});
        });

        app.post(`${CONST.API_PREFIX}reject-activity`, async (req, res) => {
            fireStoreService.rejectActivity(req.body.activityId)
            res.status(200).send({response: CONST.DEFAULT_RESPONSE});
        });

        app.post(`${CONST.API_PREFIX}approve-activity`, async (req, res) => {
          fireStoreService.approveActivity(req.body.activityId, req.body.cardIds)
          res.status(200).send({response: CONST.DEFAULT_RESPONSE});
        });
    }
}
