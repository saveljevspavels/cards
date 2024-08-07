import {Validator} from "../classes/card.class";

export default interface CardFactory {
    id: string;
    image: string;
    title: string;
    progression: Progression;
    manualValidation: boolean;
    cards: CardPrototype[]
}

export interface CardPrototype {
    tier: number;
    value: number;
    description: string;
    validators: Validator[];
    usesToProgress: number;
    energyCost: number;
    energyReward: number;
    coinsCost: number;
    coinsReward: number;
    experienceReward: number;
}

export enum Progression {
    CHAIN = 'chain',
    TIERS = 'tiers',
    FLAT = 'flat',
    NONE = 'none'
}
