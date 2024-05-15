import {RULES} from "../../../definitions/rules";

export class StaticAthleteHelperService {

    static getCardActivationCost(fatigue: number = 0): number {
        if(fatigue >= 0 && fatigue < RULES.CARD_PER_FATIGUE_ACTIVATION_COST.length - 1) {
            return RULES.CARD_PER_FATIGUE_ACTIVATION_COST[fatigue];
        } else {
            return RULES.CARD_PER_FATIGUE_ACTIVATION_COST[RULES.CARD_PER_FATIGUE_ACTIVATION_COST.length - 1];
        }
    }
}