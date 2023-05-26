import {Progression} from "./card-factory";

export default interface Card {
    title: string;
    image: string;
    tier: number;
    id: string;
    description: string;
    value: number;
    energyCost: number;
    energyReward: number;
    coinsCost: number;
    coinsReward: number;
    cardUses: CardUses;
    factoryId: string;
    progression: Progression;
    validators: Validator[];
    manualValidation: boolean;
}

export interface CardUses {
    progression: number;
    queue: number;
    usesToProgress: number;
}

export interface Validator {
    comparator: string;
    property: string;
    formula: string;
}
