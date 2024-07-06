import https from "https";
import {parseResponse} from "./helpers/util";
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import {RULES} from "../../definitions/rules";
import axios from "axios";
import {Logger} from "winston";
import {ActivityStatus} from "../shared/interfaces/activity.interface";
import AthleteService from "./athlete.service";
import ActivityService from "./activity.service";

export default class ClientService {

    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger,
        private athleteService: AthleteService,
        private activityService: ActivityService
    ) {

        // app.post(`${CONST.API_PREFIX}/calculate-base-workout`,async (req, res) => {
        //     const token = res.get('accessToken');
        //     if(!token) {
        //         return;
        //     }
        //     await this.calculateBaseWorkout(token, req.body.athleteId)
        //     if(req.body.commandId) {
        //         await this.fireStoreService.deleteCommand(req.body.commandId)
        //     }
        //     res.status(200).send({});
        // });
    }

    // async calculateBaseWorkout(accessToken: string, athleteId: string) {
    //     const athlete = await this.athleteService.getAthlete(athleteId);
    //     const activities = await this.getAthleteActivities(accessToken);
    //
    //     const baseWorkoutPatch: any = {};
    //     const properties = [
    //         CONST.ACTIVITY_PROPERTIES.DISTANCE,
    //         CONST.ACTIVITY_PROPERTIES.AVERAGE_SPEED
    //     ]
    //     const types = [
    //         CONST.ACTIVITY_TYPES.RUN,
    //         CONST.ACTIVITY_TYPES.RIDE,
    //     ]
    //
    //     types.forEach(type => {
    //         const typedActivities = activities
    //             .filter((activity: any) => activity.type.toUpperCase().indexOf(type.toUpperCase()) !== -1)
    //
    //         const total = typedActivities.reduce((acc: any, activity: any) => {
    //             properties.forEach(prop => {
    //                 if(!acc[prop]) {
    //                     acc[prop] = []
    //                 }
    //                 acc[prop].push(activity[prop])
    //             })
    //             return acc
    //         }, {})
    //
    //
    //         properties.forEach(prop => {
    //             let values = total[prop];
    //             if(!baseWorkoutPatch[type]) {
    //                 baseWorkoutPatch[type] = {}
    //             }
    //             if(values && values.length >= 4) {
    //                 values = values.sort((a: number, b: number) => a - b);
    //                 while (values.length > 4) {
    //                     values.length % 2 ? values.pop() : values.shift()
    //                 }
    //                 const sum = values.reduce((acc: any, item: any) => acc + item, 0)
    //                 baseWorkoutPatch[type][prop] = (sum/values.length);
    //                 // @ts-ignore
    //                 baseWorkoutPatch[type][prop] = baseWorkoutPatch[type][prop] - baseWorkoutPatch[type][prop] % RULES.ESTIMATION_ACCURACY[prop];
    //             } else {
    //                 // @ts-ignore
    //                 baseWorkoutPatch[type][prop] = RULES.DEFAULT_BASE_WORKOUT[type][prop]
    //             }
    //         })
    //     })
    //
    //     this.athleteService.updateBaseWorkout(athlete, baseWorkoutPatch)
    //     await this.athleteService.updateAthlete(athlete);
    // }
}
