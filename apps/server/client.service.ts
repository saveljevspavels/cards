import https from "https";
import {parseResponse} from "./helpers/util";
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import {RULES} from "../../definitions/rules";

export default class ClientService {
    fireStoreService;

    getActivityOptions(accessToken: string) {
        return {
            host: CONST.STRAVA_BASE,
            path: `/api/v3/activities`,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        }
    }

    constructor(app: Express, fireStoreService: FirestoreService) {
        this.fireStoreService = fireStoreService;

        app.post(`${CONST.API_PREFIX}/calculate-base-workout`,async (req, res) => {
            const token = res.get('accessToken');
            if(!token) {
                return;
            }
            this.calculateBaseWorkout(token, req.body.athleteId)
            if(req.body.commandId) {
                await this.fireStoreService.deleteCommand(req.body.commandId)
            }
            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}/activities`, (req, res) => {
            const token = res.get('accessToken');
            if(!token) {
                return;
            }
            https.get(this.getActivityOptions(token), response => {
                parseResponse(response, req.body, (reqBody: any, responseData: any) => {
                    responseData = responseData?.length ? responseData : [];
                    if(reqBody.activityIds?.length) {
                        responseData = responseData.filter((activity: any) => reqBody.activityIds.indexOf(activity.id) !== -1)
                    }
                    if(reqBody.from) {
                        responseData = responseData.filter((activity: any) => (+ new Date(activity.start_date)) > reqBody.from)
                    }
                    if(reqBody.commandId) {
                        this.fireStoreService.deleteCommand(reqBody.commandId)
                    }
                    responseData.forEach((activity: any) => {
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

    calculateBaseWorkout(accessToken: string, athleteId: string) {
        https.get(this.getActivityOptions(accessToken), response => {
            parseResponse(response, {}, (reqBody: any, responseData: any) => {
                const baseWorkoutPatch: any = {};
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
                        .filter((activity: any) => activity.type.toUpperCase().indexOf(type.toUpperCase()) !== -1)

                    const total = typedActivities.reduce((acc: any, activity: any) => {
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
                            values = values.sort((a: number, b: number) => a - b);
                            while (values.length > 4) {
                                values.length % 2 ? values.pop() : values.shift()
                            }
                            const sum = values.reduce((acc: any, item: any) => acc + item, 0)
                            baseWorkoutPatch[type][prop] = (sum/values.length);
                            // @ts-ignore
                            baseWorkoutPatch[type][prop] = baseWorkoutPatch[type][prop] - baseWorkoutPatch[type][prop] % RULES.ESTIMATION_ACCURACY[prop];
                        } else {
                            // @ts-ignore
                            baseWorkoutPatch[type][prop] = RULES.DEFAULT_BASE_WORKOUT[type][prop]
                        }
                    })
                })

                this.fireStoreService.updateBaseWorkout([athleteId], baseWorkoutPatch)
            })
        })
    }
}
