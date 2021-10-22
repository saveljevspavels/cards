import {Injectable} from "@angular/core";
import {Validator} from "../interfaces/card";
import {AthleteService} from "./athlete.service";
import {BaseWorkout} from "../interfaces/athlete";
import {CONST, RULES} from "../app.module";

@Injectable({
    providedIn: 'root'
})
export class ValidationService {

    private baseWorkout: BaseWorkout | null;

    constructor(private athleteService: AthleteService) {
        this.athleteService.me.subscribe((me) => {
            this.baseWorkout = me?.baseWorkout || null;
        })
    }

    resolveValidationValue(validator: Validator): number {
        if(validator.comparator.indexOf('base') !== -1) {
            switch (validator.property) {
                case CONST.ACTIVITY_PROPERTIES.DISTANCE:
                    const res = validator.value * (this.baseWorkout?.distance || RULES.DEFAULT_BASE_WORKOUT.DISTANCE)
                    return res - (res % 500)
                case CONST.ACTIVITY_PROPERTIES.AVERAGE_SPEED: return validator.value * (this.baseWorkout?.average_speed || RULES.DEFAULT_BASE_WORKOUT.AVERAGE_SPEED)
                default: return validator.value;
            }
        } else {
            switch (validator.property) {
                case CONST.ACTIVITY_PROPERTIES.START_DATE:
                    return validator.value * 60 * 60
                case CONST.ACTIVITY_PROPERTIES.ATHLETE_COUNT:
                case CONST.ACTIVITY_PROPERTIES.ACHIEVEMENT_COUNT:
                case CONST.ACTIVITY_PROPERTIES.MOVING_TIME:
                case CONST.ACTIVITY_PROPERTIES.ELAPSED_TIME:
                default: return validator.value;
            }
        }
    }

}
