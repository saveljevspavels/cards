import {AbilityKey} from "../interfaces/ability.interface";
import {RULES} from "../../../definitions/rules";
import {LEVEL_REWARDS} from "../../../definitions/level_rewards";
import {Currencies} from "./currencies.class";
import {JsonObjectInterface} from "../interfaces/json-object.interface";

export default class Athlete implements JsonObjectInterface {
    name: string;
    firstname: string;
    lastname: string;
    id: string;
    profile: string;
    baseWorkout: BaseWorkout;
    permissions: string[];
    achievements: string[];
    level: number;
    claimedLevelRewards: number[];
    currencies: Currencies;
    cards: {
        active: string[],
        completed: string[],
        claimed: string[]
    };
    baseCardProgress: BaseCardProgress;
    unlocks: {[key: string]: number};
    usedAbilities: AbilityKey[];
    perks: {[key: string]: number} = {};

    constructor(
        id: string,
        firstName: string,
        lastName: string,
        profile: string,
        name: string,
        baseWorkout: BaseWorkout,
        permissions: string[],
        achievements: string[],
        level: number,
        claimedLevelRewards: number[],
        currencies: Currencies,
        cards: {
            active: string[],
            completed: string[],
            claimed: string[]
        },
        baseCardProgress: BaseCardProgress,
        unlocks: {[key: string]: number},
        usedAbilities: AbilityKey[],
        perks: {[key: string]: number} = {}
    ) {
        this.id = id;
        this.firstname = firstName;
        this.lastname = lastName;
        this.profile = profile;
        this.name = name;
        this.baseWorkout = baseWorkout;
        this.permissions = permissions;
        this.achievements = achievements;
        this.level = level;
        this.claimedLevelRewards = claimedLevelRewards;
        this.currencies = currencies;
        this.cards = cards;
        this.baseCardProgress = baseCardProgress;
        this.unlocks = unlocks;
        this.usedAbilities = usedAbilities;
        this.perks = perks;
    }

    static fromJSONObject(json: any) {
        return new Athlete(
            json['id'],
            json['firstname'],
            json['lastname'],
            json['profile'],
            json['name'],
            json['baseWorkout'],
            json['permissions'],
            json['achievements'],
            json['level'],
            json['claimedLevelRewards'],
            json['currencies'],
            json['cards'],
            json['baseCardProgress'],
            json['unlocks'],
            json['usedAbilities'],
            json['perks'],
        )
    }

    static new(id: number, firstName: string, lastName: string, profile: string) {
        return new Athlete(
            id.toString(),
            firstName,
            lastName,
            profile,
            `${firstName} ${lastName}`,
            RULES.DEFAULT_BASE_WORKOUT,
            [],
            [],
            0,
            [],
            new Currencies(0, 0, 0, 0, 0, 0, 0),
            {
                active: [],
                completed: [],
                claimed: []
            },
            {
                run: 0,
                ride: 0,
                walk: 0,
                other: 0
            },
            {},
            [],
            {
                experience_per_task_bonus: 0,
                see_future_challenge: 0,
                task_queue_size_bonus: 0,
                base_walk_experience_bonus: 0,
                base_run_experience_bonus: 0,
                base_ride_experience_bonus: 0,
                base_other_experience_bonus: 0,
            }
        )
    }

    claimLevelRewards(level: number) {
        const rewards = LEVEL_REWARDS[level];
        if(!rewards) return;
        this.currencies.coins = (this.currencies.coins || 0) + rewards.coins || 0;
        this.currencies.experience = (this.currencies.experience || 0) + rewards.experience || 0;
        this.currencies.chests = (this.currencies.chests || 0) + rewards.chests || 0;
        this.currencies.perks = (this.currencies.perks || 0) + rewards.perks || 0;
        this.currencies.random_perks = (this.currencies.random_perks || 0) + rewards.random_perks || 0;
        this.currencies.energy = (this.currencies.energy || 0) + rewards.energy || 0;
        this.currencies.fatigue = (this.currencies.fatigue || 0) + rewards.fatigue || 0;

        this.claimedLevelRewards.push(level);
    }

    toJSONObject(): object {
        return {
            id: this.id,
            firstname: this.firstname,
            lastname: this.lastname,
            profile: this.profile,
            name: this.name,
            baseWorkout: this.baseWorkout,
            permissions: this.permissions,
            achievements: this.achievements,
            level: this.level,
            claimedLevelRewards: this.claimedLevelRewards,
            currencies: this.currencies.toJSONObject(),
            cards: this.cards,
            baseCardProgress: this.baseCardProgress,
            unlocks: this.unlocks,
            usedAbilities: this.usedAbilities
        }
    }
}


export interface AthletePatch {
    name: string;
    firstname: string;
    lastname: string;
    profile: string;
}

export interface BaseWorkout {
    run: {
        distance: number;
        average_speed?: number;
        time_3k?: number;
        time_5k?: number;
        time_10k?: number;
    }
    ride: {
        distance: number;
        average_speed?: number;
        time_40k?: number;
    };
    walk: {
        distance: number;
    };
    other: {
        distance: number;
        elapsed_time: number;
    }
}

export interface BaseCardProgress {
    run: number;
    ride: number;
    walk: number;
    other: number;
}