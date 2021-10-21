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
                case 'distance':
                    const res = validator.value * (this.baseWorkout?.distance || RULES.DEFAULT_BASE_WORKOUT.DISTANCE)
                    return res - (res % 500)
                case 'average_speed': return validator.value * (this.baseWorkout?.average_speed || RULES.DEFAULT_BASE_WORKOUT.AVERAGE_SPEED)
                default: return 0;
            }
        } else {
            return validator.value;
        }
    }



}
