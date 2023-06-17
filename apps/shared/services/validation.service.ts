import {RULES} from "../../../definitions/rules";
import {CONST} from "../../../definitions/constants";
import {normalizeActivityType} from "../../server/helpers/util";
import Card, {Validator} from "../interfaces/card.interface";
import {BaseCardProgress, BaseWorkout} from "../interfaces/athlete.interface";

export class StaticValidationService {

    static baseActivityTypeMap = new Map<string, string>([
        [CONST.ACTIVITY_TYPES.OTHER, CONST.ACTIVITY_PROPERTIES.ELAPSED_TIME],
        [CONST.ACTIVITY_TYPES.RUN, CONST.ACTIVITY_PROPERTIES.DISTANCE],
        [CONST.ACTIVITY_TYPES.RIDE, CONST.ACTIVITY_PROPERTIES.DISTANCE],
        [CONST.ACTIVITY_TYPES.WALK, CONST.ACTIVITY_PROPERTIES.DISTANCE],
    ]);

    static resolveValidationValue(validator: any, baseWorkout: any) {
        if(baseWorkout !== null) {
            return Object.keys(RULES.DEFAULT_BASE_WORKOUT).reduce((acc: any, type) => {
                try {
                    acc[type] = this.evaluateFormula(validator.formula, validator.property, baseWorkout[type])
                } catch (err) {}
                return acc
            }, {})
        } else return 0;
    }

    static evaluateFormula(formula: any, property: any, values = {}) {
        Object.entries(values).forEach(([key, value]) => {
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

    static getActivityValue(activity: any, validator: Validator, activityHealth = RULES.PROGRESS_PRECISION) {
        const baseValue = validator.property === CONST.ACTIVITY_PROPERTIES.START_DATE
            ? this.getTimeInSeconds(activity[validator.property])
            : activity[validator.property];
        return typeof baseValue === "number" ? Math.ceil((baseValue * activityHealth) / RULES.PROGRESS_PRECISION) : baseValue;
    }

    static validateRule(activity: any, validator: Validator, baseWorkout: BaseWorkout): boolean {
        const type = normalizeActivityType(activity.type);

        const activityVal = StaticValidationService.getActivityValue(activity, validator);
        const validatorVal = this.resolveValidationValue(validator, baseWorkout)[type]

        switch (validator.comparator) {
            case CONST.COMPARATORS.GREATER:
                return activityVal >= validatorVal;
            case CONST.COMPARATORS.LESS:
                return activityVal < validatorVal
            case CONST.COMPARATORS.IN:
                return validatorVal.toString().toUpperCase().indexOf(normalizeActivityType(activityVal).toUpperCase()) !== -1
            case CONST.COMPARATORS.NOT_IN:
                return validatorVal.toString().toUpperCase().indexOf(normalizeActivityType(activityVal).toUpperCase()) === -1
            case CONST.COMPARATORS.EQUALS:
            default:
                return activityVal === validatorVal
        }
    }

    static validateCards(activity: any, cards: Card[], baseWorkout: BaseWorkout): boolean {
        return cards
            .reduce((acc: any, card: any) =>
                card.validators.reduce((acc: any, validator: any) =>
                    acc && StaticValidationService.validateRule(activity, validator, baseWorkout),
                    true
                ),
                []
            );
    }

    static validateCardGroup(activity: any, cards: Card[], baseWorkout: BaseWorkout): boolean {
        let result: boolean = true;
        cards.forEach((card: Card, index: number) => {
            if(index > 0) {
                activity = this.spendActivity(activity, cards[index - 1], baseWorkout)
            }
            result = result && this.validateCards(activity, [card], baseWorkout);
        })
        return result;
    }

    static getActivityRemainder(activity: any, cards: Card[], baseWorkout: BaseWorkout): number {
        if(!activity) {
            return 0;
        }
        cards.forEach((card: Card, index: number) => {
            activity = this.spendActivity(activity, cards[index], baseWorkout);
        })
        return activity;
    }

    static getBaseCardProgress(activity: any, baseWorkout: BaseWorkout): number {
        const activityType = normalizeActivityType(activity.type) || '';
        const property = StaticValidationService.baseActivityTypeMap.get(activityType) || '';
        const activityValue = activity[property]
        // @ts-ignore
        const baseValue = baseWorkout[activityType][property];
        return Math.ceil((activityValue * RULES.PROGRESS_PRECISION) / baseValue);
    }

    static updateBaseCardProgress(activity: any, baseWorkout: BaseWorkout, baseCardProgress: BaseCardProgress): BaseCardProgress {
        const progress = StaticValidationService.getBaseCardProgress(activity, baseWorkout);
        const result = {...baseCardProgress};
        // @ts-ignore
        result[normalizeActivityType(activity.type)] = baseCardProgress[normalizeActivityType(activity.type)] + progress;
        return result;
    }

    static spendActivity(activity: any, card: Card, baseWorkout: BaseWorkout): any {
        const spendableValidator = card.validators.find(validator =>
            validator.property === CONST.ACTIVITY_PROPERTIES.DISTANCE
            || validator.property === CONST.ACTIVITY_PROPERTIES.ELAPSED_TIME
            || validator.property === CONST.ACTIVITY_PROPERTIES.MOVING_TIME);
        if(!spendableValidator) {
            return activity;
        }

        const type = normalizeActivityType(activity.type);
        const value = StaticValidationService.getActivityValue(activity, spendableValidator);
        const activityCopy = {...activity};
        activityCopy[spendableValidator.property] = value - StaticValidationService.resolveValidationValue(spendableValidator, baseWorkout)[type];
        return activityCopy;
    }

    static getTimeInSeconds(ISODate: any) {
        const date = new Date(ISODate)
        return date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds();
    }
}

export enum ValidationStatus {
    PASS = 'pass',
    FAIL = 'fail',
    NONE = 'none',
    SELECTED = 'selected'
}