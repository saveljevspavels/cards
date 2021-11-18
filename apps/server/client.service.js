import https from "https";
import CONST from "../../definitions/constants.json";
import RULES from "../../definitions/rules.json";
import {parseResponse} from "./util.js";

export default class ClientService {
    fireStoreService;

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
        this.fireStoreService = fireStoreService;

        app.post(`${CONST.API_PREFIX}save-athlete`,async (req, res) => {
            const newAthlete = await this.fireStoreService.saveAthlete(req.body.athlete)

            if(newAthlete) {
                this.calculateBaseWorkout(req.body.accessToken, req.body.athlete.id)
            }

            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}calculate-base-workout`,async (req, res) => {
            this.calculateBaseWorkout(req.body.accessToken, req.body.athleteId)

            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}activities`, (req, res) => {
            https.get(this.getActivityOptions(req.body.accessToken), response => {
                parseResponse(response, req.body, (reqBody, responseData) => {
                    responseData = responseData?.length ? responseData : [];
                    if(reqBody.activityIds?.length) {
                        responseData = responseData.filter(activity => reqBody.activityIds.indexOf(activity.id) !== -1)
                    }
                    if(reqBody.from) {
                        responseData = responseData.filter(activity => (+ new Date(activity.start_date)) > reqBody.from)
                    }
                    if(reqBody.commandId) {
                        this.fireStoreService.deleteCommand(reqBody.commandId)
                    }
                    responseData.forEach((activity) => {
                        this.fireStoreService.deletePendingActivity(activity.id);
                        this.fireStoreService.addDetailedActivity({ ...activity,
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

    calculateBaseWorkout(accessToken, athleteId) {
        console.log(accessToken, athleteId)
        https.get(this.getActivityOptions(accessToken), response => {
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
                if(!total[properties[0]]) {
                    return
                }

                properties.forEach(prop => {
                    total[prop] = total[prop].sort((a,b) => a - b);
                    while (total[prop].length > 4) {
                        total[prop].length % 2 ? total[prop].pop() : total[prop].shift()
                    }
                    const sum = total[prop].reduce((acc, item) => acc + item, 0)
                    baseWorkout[prop] = (sum/total[prop].length);
                    baseWorkout[prop] = baseWorkout[prop] - baseWorkout[prop] % RULES.ESTIMATION_ACCURACY[prop];
                })

                this.fireStoreService.updateBaseWorkout([athleteId], baseWorkout)
            })
        })
    }
}
