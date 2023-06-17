import {Injectable} from "@angular/core";
import Card, {Validator} from "../../../../shared/interfaces/card.interface";
import {AthleteService} from "./athlete.service";
import {BaseWorkout} from "../../../../shared/interfaces/athlete.interface";
import {StaticValidationService} from "../../../../shared/services/validation.service";

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

    resolveValidationValue(validator: Validator, baseWorkout: any = this.baseWorkout): any {
        return StaticValidationService.resolveValidationValue(validator, baseWorkout);
    }

    evaluateFormula(formula: string, property: string, values: any = {}) {
        return StaticValidationService.evaluateFormula(formula, property, values);
    }

    validateRule(activity: any, validator: Validator, baseWorkout = this.baseWorkout): boolean {
        if (!baseWorkout) {
            return false;
        }
        return StaticValidationService.validateRule(activity, validator, baseWorkout);
    }

    validateCards(activity: any, cards: Card[], baseWorkout = this.baseWorkout): boolean {
        if (!baseWorkout) {
            return false;
        }
        return StaticValidationService.validateCards(activity, cards, baseWorkout);
    }

    validateCardGroup(activity: any, cards: Card[], baseWorkout = this.baseWorkout): boolean {
        if (!baseWorkout) {
            return false;
        }
        return StaticValidationService.validateCardGroup(activity, cards, baseWorkout);
    }

    getActivityRemainder(activity: any, cards: Card[], baseWorkout = this.baseWorkout): any {
        if (!baseWorkout) {
            return null;
        }
        return StaticValidationService.getActivityRemainder(activity, cards, baseWorkout);
    }

    getBaseCardProgress(activity: any, baseWorkout = this.baseWorkout): number {
        if (!baseWorkout) {
            return 0;
        }
        return StaticValidationService.getBaseCardProgress(activity, baseWorkout);
    }
}
