import {AbilityKey} from "../interfaces/ability.interface";
import {RULES} from "../../../definitions/rules";
import {LEVEL_REWARDS} from "../../../definitions/level_rewards";
import {Currencies} from "./currencies.class";
import {JsonObjectInterface} from "../interfaces/json-object.interface";
import {RESPONSES} from "../../server/response-codes";
import MathHelper from "../../server/helpers/math.helper";
import { SCHEME, BOARD_KEY } from '../../../definitions/scheme';
import { getRandomInt } from '../../server/helpers/util';

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
    luck: number;
    claimedLevelRewards: number[];
    currencies: Currencies;
    cards: {
        active: string[],
        completed: string[],
        claimed: string[]
    };
    baseCardProgress: BaseCardProgress;
    unlocks: {[K in BOARD_KEY]: number[]};
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
        luck: number,
        claimedLevelRewards: number[],
        currencies: Currencies,
        cards: {
            active: string[],
            completed: string[],
            claimed: string[]
        },
        baseCardProgress: BaseCardProgress,
        unlocks: {[K in BOARD_KEY]: number[]},
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
        this.luck = luck;
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
            json['luck'],
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
            ['default'],
            [],
            0,
            0,
            [],
            new Currencies(0, 0, 0, 0, 0, 0, 3),
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
            {
                [BOARD_KEY.JACK]: [0],
                [BOARD_KEY.WANDERER]: [0],
                [BOARD_KEY.PHOTO]: [0],
                [BOARD_KEY.SPORT]: [0],
                [BOARD_KEY.SPECIAL]: []
            },
            [],
            {
            }
        )
    }

    get logName(): string {
        return `${this.name} (${this.id})`;
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
        if(currencies.special_task) {
            const levelAmount = SCHEME.boards.find(board => board.key === BOARD_KEY.SPECIAL)?.levels.length || 0;
            const lockedLevels = [];
            for(let i = 0; i < levelAmount; i++) {
                if(!this.unlocks[BOARD_KEY.SPECIAL].includes(i)) {
                    lockedLevels.push(i);
                }
            }
            for(let i = 0; i < currencies.special_task; i++) {
                if(lockedLevels.length === 0) {
                    break;
                }
                const randomLockedLevel = getRandomInt(lockedLevels.length);
                this.unlocks[BOARD_KEY.SPECIAL].push(lockedLevels[randomLockedLevel]);
                lockedLevels.splice(randomLockedLevel, 1);
            }
        }
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
            luck: this.luck ?? 0,
            claimedLevelRewards: this.claimedLevelRewards,
            currencies: this.currencies.toJSONObject(),
            cards: this.cards,
            baseCardProgress: this.baseCardProgress,
            unlocks: this.unlocks,
            usedAbilities: this.usedAbilities,
            perks: this.perks,
        }
    }

    getPerkLevel(perk: AbilityKey): number {
        return this.perks[perk] || 0;
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
