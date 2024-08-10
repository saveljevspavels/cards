import {Progression} from "../interfaces/card-factory.interface";
import {UploadedImage} from "../interfaces/image-upload.interface";
import {Currencies} from "./currencies.class";

export class Card {
    title: string;
    image?: string;
    tier: number;
    id: string;
    description: string;
    rewards: Currencies;
    energyCost: number;
    coinsCost: number;
    cardUses: CardUses;
    factoryId: string;
    progression: Progression;
    validators: Validator[];
    manualValidation: boolean;
    tags: CardTag[];

    constructor(
        title: string,
        image: string,
        tier: number,
        id: string,
        description: string,
        rewards: Currencies,
        energyCost: number,
        coinsCost: number,
        cardUses: CardUses,
        factoryId: string,
        progression: Progression,
        validators: Validator[],
        manualValidation: boolean,
        tags: CardTag[]
    ) {
        this.title = title;
        this.image = image;
        this.tier = tier;
        this.id = id;
        this.description = description;
        this.rewards = rewards;
        this.energyCost = energyCost;
        this.coinsCost = coinsCost;
        this.cardUses = cardUses;
        this.factoryId = factoryId;
        this.progression = progression;
        this.validators = validators;
        this.manualValidation = manualValidation;
        this.tags = tags;
    }

    static fromJSONObject(json: any): Card {
        return new Card(
            json.title,
            json.image,
            json.tier,
            json.id,
            json.description,
            Currencies.fromJSONObject(json.rewards),
            json.energyCost,
            json.coinsCost,
            json.cardUses,
            json.factoryId,
            json.progression,
            json.validators,
            json.manualValidation,
            json.tags || [],
        );

    }

    toJSONObject(): any {
        return {
            title: this.title,
            image: this.image,
            tier: this.tier,
            id: this.id,
            description: this.description,
            rewards: this.rewards.toJSONObject(),
            energyCost: this.energyCost,
            coinsCost: this.coinsCost,
            cardUses: this.cardUses,
            factoryId: this.factoryId,
            progression: this.progression,
            validators: this.validators,
            manualValidation: this.manualValidation,
            tags: this.tags,
        };
    }

    static empty(): Card {
        return new Card(
            '',
            '',
            0,
            '',
            '',
            new Currencies(),
            0,
            0,
            {progression: 0, usesToProgress: 0},
            '',
            Progression.NONE,
            [],
            false,
            [],
        );
    }
}

export class CardSnapshot extends Card {
    comment?: string;
    attachedImages?: UploadedImage[];
    likes?: string[];
    likedByMe?: boolean; // FE use only
    reportedByMe?: boolean; // FE use only
    reports?: Report[];

    toJSONObject(): any {
        return {
            ...super.toJSONObject(),
            comment: this.comment,
            attachedImages: this.attachedImages,
            likes: this.likes,
        };
    }

    static fromJSONObject(json: any): CardSnapshot {
        const snapshot = new CardSnapshot(
            json.title,
            json.image,
            json.tier,
            json.id,
            json.description,
            Currencies.fromJSONObject(json.rewards),
            json.energyCost,
            json.coinsCost,
            json.cardUses,
            json.factoryId,
            json.progression,
            json.validators,
            json.manualValidation,
            json.tags,
        );
        snapshot.comment = json.comment;
        snapshot.attachedImages = json.attachedImages;
        snapshot.likes = json.likes;
        return snapshot
    }
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
    photohunter = 'photohunter',
}