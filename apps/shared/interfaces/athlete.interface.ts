import {AbilityKey} from "./ability.interface";

export default interface Athlete {
    name: string;
    firstname: string;
    lastname: string;
    id: string;
    profile: string;
    baseWorkout: BaseWorkout;
    permissions: string[];
    achievements: string[];
    energy: number;
    fatigue: number;
    level: number;
    experience: number;
    coins: number;
    cards: {
        active: string[],
        completed: string[],
        finished: string[]
    };
    baseCardProgress: BaseCardProgress;
    unlocks: {[key: string]: number},
    usedAbilities: AbilityKey[];
}

export interface AthletePatch {
    name: string;
    firstname: string;
    lastname: string;
    profile: string;
}

export interface BaseWorkout {
    run?: {
        distance?: number;
        average_speed?: number;
        time_3k?: number;
        time_5k?: number;
        time_10k?: number;
    }
    ride?: {
        distance?: number;
        average_speed?: number;
        time_40k?: number;
    };
    walk?: {
        distance?: number;
    };
    other?: {
        distance?: number;
        elapsed_time?: number;
    }
}

export interface BaseCardProgress {
    run: number;
    ride: number;
    walk: number;
    other: number;
}