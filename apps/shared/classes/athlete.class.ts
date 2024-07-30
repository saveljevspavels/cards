import {AbilityKey} from "../interfaces/ability.interface";
import {RULES} from "../../../definitions/rules";
import {LEVEL_REWARDS} from "../../../definitions/level_rewards";
import {Currencies} from "./currencies.class";
import {JsonObjectInterface} from "../interfaces/json-object.interface";
import {RESPONSES} from "../../server/response-codes";
import MathHelper from "../../server/helpers/math.helper";

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
            Currencies.fromJSONObject(json['currencies']),
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
                other: 0,
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

    spendCoins(amount: number) {
        if(this.currencies.coins < amount) {
            throw 'Not enough coins';
        }
        this.currencies.coins -= amount;
    }

    increaseFatigue(amount: number) {
        if(this.currencies.fatigue >= RULES.FATIGUE.MAX) {
            throw 'Max. fatigue reached';
        }

        this.currencies.fatigue = parseInt(String(this.currencies.fatigue || 0), 10) + parseInt(String(amount), 10);
    }

    spendEnergy(amount: number) {
        if(this.currencies.energy <= RULES.ENERGY.MIN || this.currencies.energy < amount) {
            throw RESPONSES.ERROR.NOT_ENOUGH_ENERGY;
        }

        this.currencies.energy = parseInt(String(this.currencies.energy || 0), 10) - parseInt(String(amount), 10);
    }

    addEnergy(amount: number) {
        if(amount > 0 && this.currencies.energy >= RULES.ENERGY.MAX) {
            throw 'Max. energy reached';
        }

        this.currencies.energy = parseInt(String(this.currencies.energy || 0), 10) + parseInt(String(amount), 10);
    }

    updateBaseWorkout(baseWorkoutPatch: any) {
        const currentBaseWorkout = this.baseWorkout;
        this.baseWorkout = {
            ...currentBaseWorkout,
            ...Object.keys(baseWorkoutPatch).reduce((acc: any, type) => {
                // @ts-ignore
                acc[type] = {...currentBaseWorkout[type], ...baseWorkoutPatch[type]}
                return acc;
            }, {})
        }
    }

    addPerk(perk: AbilityKey) {
        if(this.perks[perk] || this.perks[perk] === 0) {
            this.perks[perk] += 1;
        } else {
            this.perks[perk] = 1;
        }
    }

    addExperience(amount: number) {
        this.currencies.experience = MathHelper.add(this.currencies.experience, amount);
        this.levelUp();
    }

    levelUp() {
        while (this.level < LEVEL_REWARDS.length && this.currencies.experience >= RULES.LEVEL_EXPERIENCE[this.level]) {
            this.currencies.experience -= RULES.LEVEL_EXPERIENCE[this.level];
            this.level++;
        }
    }

    addCurrencies(currencies: Currencies) {
        if(!currencies) return;
        this.addExperience(currencies.experience);
        this.addEnergy(currencies.energy);
        this.currencies.coins = MathHelper.add(this.currencies.coins, currencies.coins);
        this.currencies.chest = MathHelper.add(this.currencies.chest, currencies.chest);
        this.currencies.perk = MathHelper.add(this.currencies.perk, currencies.perk);
        this.currencies.random_perk = MathHelper.add(this.currencies.random_perk, currencies.random_perk);
        this.currencies.fatigue = MathHelper.add(this.currencies.coins, currencies.fatigue);
    }

    claimLevelRewards(level: number) {
        const rewards = LEVEL_REWARDS[level];
        this.addCurrencies(rewards);
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
            usedAbilities: this.usedAbilities,
            perks: this.perks,
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