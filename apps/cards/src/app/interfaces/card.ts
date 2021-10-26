import {Progression} from "./card-factory";

export default interface Card {
    title: string;
    image: '';
    tier: number;
    id: string;
    description: string;
    value: number;
    cardUses: CardUses;
    factoryId: string;
    progression: Progression;
    validators: Validator[];
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
