import {Injectable} from "@angular/core";
import {Validator} from "../interfaces/card";
import {AthleteService} from "./athlete.service";
import {BaseWorkout} from "../interfaces/athlete";
import {CONST, RULES} from "../app.module";
import {UtilService} from "./util.service";

@Injectable({
    providedIn: 'root'
})
export class ValidationService {

    private RULES = RULES;
    private baseWorkout: BaseWorkout | null;

    constructor(private athleteService: AthleteService) {
        this.athleteService.me.subscribe((me) => {
            this.baseWorkout = me?.baseWorkout || null;
        })
    }

    resolveValidationValue(validator: Validator, baseWorkout: any = this.baseWorkout ): any {
        if(baseWorkout !== null) {
            return Object.keys(this.RULES.DEFAULT_BASE_WORKOUT).reduce((acc: any, type) => {
                try {
                    acc[type] = this.evaluateFormula(validator.formula, validator.property, baseWorkout[type])
                } catch (err) {}
                return acc
            }, {})
        } else return 0;
    }

    evaluateFormula(formula: string, property: string, values: any = {}) {
        Object.entries(values).forEach(([key, value]: any) => {
            formula = formula.replace(key, value)
        })

        switch (property) {
            case CONST.ACTIVITY_PROPERTIES.TYPE:
                return formula;
            case CONST.ACTIVITY_PROPERTIES.DISTANCE:
                const value = eval(formula);
                return value - (value % 100);
            case CONST.ACTIVITY_PROPERTIES.START_DATE:
                return eval(formula) * 60 * 60;
            default: return eval(formula);
        }
    }

    validateRule(activity: any, validator: Validator, baseWorkout = this.baseWorkout) {
        const type = UtilService.normalizeActivityType(activity.type);

        const activityVal = validator.property === CONST.ACTIVITY_PROPERTIES.START_DATE
            ? this.getTimeInSeconds(activity[validator.property])
            : activity[validator.property]
        const validatorVal = this.resolveValidationValue(validator, baseWorkout)[type]

        switch (validator.comparator) {
            case CONST.COMPARATORS.GREATER:
                return activityVal >= validatorVal;
            case CONST.COMPARATORS.LESS:
                return activityVal < validatorVal
            case CONST.COMPARATORS.IN:
                return validatorVal.toString().toUpperCase().indexOf(UtilService.normalizeActivityType(activityVal).toUpperCase()) !== -1
            case CONST.COMPARATORS.NOT_IN:
                return validatorVal.toString().toUpperCase().indexOf(UtilService.normalizeActivityType(activityVal).toUpperCase()) === -1
            case CONST.COMPARATORS.EQUALS:
            default:
                return activityVal === validatorVal
        }
    }

    getTimeInSeconds(ISODate: string): number {
        const date = new Date(ISODate)
        return date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds();
    }
}
