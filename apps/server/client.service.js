import https from "https";
import CONST from "../../definitions/constants.json";
import {parseResponse} from "./util.js";

export default class ClientService {
    getActivityOptions(accessToken) {
        return {
            host: CONST.STRAVA_BASE,
            path: `/api/v3/activities`,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        }
    }

    constructor(app, fireStoreService) {

        app.post(`${CONST.API_PREFIX}save-athlete`,async (req, res) => {
            const newAthlete = await fireStoreService.saveAthlete(req.body.athlete)

            if(newAthlete) {
                https.get(this.getActivityOptions(req.body.accessToken), response => {
                    parseResponse(response, {}, (reqBody, responseData) => {
                        const baseWorkout = {}
                        const properties = [
                            CONST.ACTIVITY_PROPERTIES.DISTANCE,
                            CONST.ACTIVITY_PROPERTIES.AVERAGE_SPEED
                        ]
                        const total = responseData
                            .filter(activity => activity.type.toUpperCase() === 'run'.toUpperCase())
                            .reduce((acc, activity) => {
                                properties.forEach(prop => {
                                    if(!acc[prop]) {
                                        acc[prop] = []
                                    }
                                    acc[prop].push(activity[prop])
                                })
                                return acc
                            }, {})
                        properties.forEach(prop => {
                            const sum = total[prop].reduce((acc, item) => acc + item, 0)
                            baseWorkout[prop] = sum/total[prop].length
                        })

                        fireStoreService.updateBaseWorkout([req.body.athlete.id], baseWorkout)
                    })
                })
            }

            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}activities`, (req, res) => {
            https.get(this.getActivityOptions(req.body.accessToken), response => {
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
