import {Progression} from "./card-factory.interface";
import {UploadedImage} from "./image-upload.interface";

export default interface Card {
    title: string;
    image: string;
    tier: number;
    id: string;
    description: string;
    value: number;
    energyCost: number;
    energyReward: number;
    experienceReward: number;
    coinsCost: number;
    coinsReward: number;
    cardUses: CardUses;
    factoryId: string;
    progression: Progression;
    validators: Validator[];
    manualValidation: boolean;
    tags: CardTag[];
}

export interface CardSnapshot extends Card {
    comment?: string;
    attachedImages?: UploadedImage[];
    likes?: string[];
    likedByMe?: boolean; // FE use only
    reportedByMe?: boolean; // FE use only
    reports?: Report[];
}

export interface CardUses {
    progression: number;
    usesToProgress: number;
}

export interface Validator {
    comparator: string;
    property: string;
    formula: string;
}

export interface Report {
    id: string;
    createdBy: string;
    comment: string;
    resolved: boolean;
}

export const NullCard: Card = {
    title: '',
    image: '',
    tier: 0,
    id: '',
    description: '',
    value: 0,
    energyCost: 0,
    energyReward: 0,
    coinsCost: 0,
    coinsReward: 0,
    experienceReward: 0,
    cardUses: {
      progression: 0,
      usesToProgress: 0,
    },
    factoryId: '',
    progression: Progression.NONE,
    validators: [],
    manualValidation: false,
    tags: [],
}

export enum CardTag {
    unknown = 'unknown',
    bird = 'bird',
    animal = 'animal',
    distance= 'distance',
    run = 'run',
    ride =  'ride',
    walk = 'walk',
    multitasker = 'multitasker',
    wanderer = 'wanderer',
}