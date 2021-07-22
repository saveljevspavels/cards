import https from "https";
import CONST from "../../definitions/constants.json";
import {parseResponse} from "./util.js";

export default class ClientService {
    constructor(app, fireStoreService) {

        app.post(`${CONST.API_PREFIX}save-athlete`, (req, res) => {
          fireStoreService.saveAthlete(req.body.athlete)
          res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}activities`, (req, res) => {
            const options = {
                host: CONST.STRAVA_BASE,
                path: `/api/v3/activities`,
                headers: {
                    'Authorization': `Bearer ${req.body.accessToken}`,
                },
            }
            https.get(options, response => {
                parseResponse(response, req.body, (reqBody, responseData) => {
                    if(reqBody.activityIds?.length) {
                        responseData = responseData.filter(activity => reqBody.activityIds.indexOf(activity.id) !== -1)
                    }
                    if(reqBody.from) {
                        responseData = responseData.filter(activity => (+ new Date(activity.start_date)) > reqBody.from)
                    }
                    if(reqBody.commandId) {
                        fireStoreService.deleteCommand(reqBody.commandId)
                    }
                    responseData.forEach((activity) => {
                        fireStoreService.deletePendingActivity(activity.id);
                        fireStoreService.addDetailedActivity({ ...activity,
                            gameData: {
                                status: CONST.ACTIVITY_STATUSES.NEW
                            }
                        });
                    })
                    res.status(200).send(responseData);
                })

            })
        });
    }
}
