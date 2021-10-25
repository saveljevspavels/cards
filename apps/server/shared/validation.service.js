import CONST from "../../../definitions/constants.json";
import RULES from "../../../definitions/rules.json";

export class ValidationService {
    static resolveValidationValue(baseWorkout, validator) {
        if(validator.comparator.indexOf('base') !== -1) {
            switch (validator.property) {
                case CONST.ACTIVITY_PROPERTIES.DISTANCE:
                    const res = validator.value * (baseWorkout?.distance || RULES.DEFAULT_BASE_WORKOUT.DISTANCE)
                    return res - (res % 500)
                case CONST.ACTIVITY_PROPERTIES.AVERAGE_SPEED: return validator.value * (baseWorkout?.average_speed || RULES.DEFAULT_BASE_WORKOUT.AVERAGE_SPEED)
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

    static validateRule(baseWorkout, activity, validator) {
        const activityVal = validator.property === CONST.ACTIVITY_PROPERTIES.START_DATE
            ? ValidationService.getTimeInSeconds(activity[validator.property])
            : activity[validator.property]
        const validatorVal = this.resolveValidationValue(baseWorkout, validator)

        switch (validator.comparator) {
            case CONST.COMPARATORS.BASE_GREATER:
            case CONST.COMPARATORS.GREATER:
                return activityVal >= validatorVal;
            case CONST.COMPARATORS.BASE_LESS:
            case CONST.COMPARATORS.LESS:
                return activityVal < validatorVal
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
