import CONST from "../../../definitions/constants.json";
import RULES from "../../../definitions/rules.json";

export class ValidationService {
    static resolveValidationValue(validator, baseWorkout ) {
        if(baseWorkout !== null) {
            let formula = validator.formula;
            Object.entries(baseWorkout).forEach(([key, value]) => {
                formula = formula.replace(key, value)
            })
            switch (validator.property) {
                case CONST.ACTIVITY_PROPERTIES.TYPE:
                    return formula;
                case CONST.ACTIVITY_PROPERTIES.DISTANCE:
                    const value = eval(formula);
                    return value - (value % 100)
                case CONST.ACTIVITY_PROPERTIES.START_DATE:
                    return eval(formula) * 60 * 60
                default: return eval(formula);
            }
        } else return 0;
    }

    static validateRule(activity, validator, baseWorkout) {
        const activityVal = validator.property === CONST.ACTIVITY_PROPERTIES.START_DATE
            ? ValidationService.getTimeInSeconds(activity[validator.property])
            : activity[validator.property]
        const validatorVal = this.resolveValidationValue(validator, baseWorkout)

        switch (validator.comparator) {
            case CONST.COMPARATORS.GREATER:
                return activityVal >= validatorVal;
            case CONST.COMPARATORS.LESS:
                return activityVal < validatorVal
            case CONST.COMPARATORS.IN:
                return validatorVal.toString().toUpperCase().indexOf(activityVal.toUpperCase()) !== -1
            case CONST.COMPARATORS.NOT_IN:
                return validatorVal.toString().toUpperCase().indexOf(activityVal.toUpperCase()) === -1
            case CONST.COMPARATORS.EQUALS:
            default:
                return activityVal === validatorVal
        }
    }

    static getTimeInSeconds(ISODate) {
        const date = new Date(ISODate)
        return date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds();
    }
}
