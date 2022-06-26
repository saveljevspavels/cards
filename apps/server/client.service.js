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

            // if(newAthlete) { // Let's do it manually for now
            //     this.calculateBaseWorkout(req.body.accessToken, req.body.athlete.id)
            // }

            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}calculate-base-workout`,async (req, res) => {
            this.calculateBaseWorkout(req.body.accessToken, req.body.athleteId)
            if(req.body.commandId) {
                await this.fireStoreService.deleteCommand(req.body.commandId)
            }
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
        https.get(this.getActivityOptions(accessToken), response => {
            parseResponse(response, {}, (reqBody, responseData) => {
                const baseWorkoutPatch = {};
                const properties = [
                    CONST.ACTIVITY_PROPERTIES.DISTANCE,
                    CONST.ACTIVITY_PROPERTIES.AVERAGE_SPEED
                ]
                const types = [
                    CONST.ACTIVITY_TYPES.RUN,
                    CONST.ACTIVITY_TYPES.RIDE,
                ]

                types.forEach(type => {
                    const typedActivities = responseData
                        .filter(activity => activity.type.toUpperCase().indexOf(type.toUpperCase()) !== -1)

                    const total = typedActivities.reduce((acc, activity) => {
                        properties.forEach(prop => {
                            if(!acc[prop]) {
                                acc[prop] = []
                            }
                            acc[prop].push(activity[prop])
                        })
                        return acc
                    }, {})


                    properties.forEach(prop => {
                        let values = total[prop];
                        if(!baseWorkoutPatch[type]) {
                            baseWorkoutPatch[type] = {}
                        }
                        if(values && values.length >= 4) {
                            values = values.sort((a,b) => a - b);
                            while (values.length > 4) {
                                values.length % 2 ? values.pop() : values.shift()
                            }
                            const sum = values.reduce((acc, item) => acc + item, 0)
                            baseWorkoutPatch[type][prop] = (sum/values.length);
                            baseWorkoutPatch[type][prop] = baseWorkoutPatch[type][prop] - baseWorkoutPatch[type][prop] % RULES.ESTIMATION_ACCURACY[prop];
                        } else {
                            baseWorkoutPatch[type][prop] = RULES.DEFAULT_BASE_WORKOUT[type][prop]
                        }
                    })
                })

                this.fireStoreService.updateBaseWorkout([athleteId], baseWorkoutPatch)
            })
        })
    }
}
