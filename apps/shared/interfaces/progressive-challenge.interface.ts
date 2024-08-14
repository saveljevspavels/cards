import {ActivityType} from "./activity.interface";
import {CardTag} from "../classes/card.class";

export interface ProgressiveChallenge {
    id: string;
    image: string;
    stat: ChallengeStatType;
    targetValue: number;
    activityType: ActivityType | null;
    title: string;
    description: string;
    notes: string[];
    icon?: string;
    color?: string;
    rewards: {
        points: number;
        coins: number;
        experience: number;
    },
    evaluateImmediate: boolean;
}

export enum ChallengeStatType {
    DISTANCE = "DISTANCE",
    WANDERER_TASKS = "WANDERER_TASKS",
    MULTITASKER_TASKS = "MULTITASKER_TASKS",
    PHOTOHUNTER_TASKS = "PHOTOHUNTER_TASKS",
    HARDWORKER_TASKS = "HARDWORKER_TASKS",
    MOVING_TIME = "MOVING_TIME",
    ELAPSED_TIME = "ELAPSED_TIME",
    COMPLETED_TASKS = "COMPLETED_TASKS",
    DAILY_COMPLETED_TASKS = "DAILY_COMPLETED_TASKS",
    BASIC_TASKS = "BASIC_TASKS",
    HEARTBEATS = "HEARTBEATS",
    ELEVATION_GAIN = "ELEVATION_GAIN",
    STORE_SPENT_COINS = "STORE_SPENT_COINS",
    ACTIVITY_COUNT = "ACTIVITY_COUNT",
    CARD_UNLOCK = "CARD_UNLOCK",
}

export const ChallengeStatTagMap: Map<ChallengeStatType, CardTag> = new Map([
    [ChallengeStatType.WANDERER_TASKS, CardTag.wanderer],
    [ChallengeStatType.MULTITASKER_TASKS, CardTag.multitasker],
    [ChallengeStatType.PHOTOHUNTER_TASKS, CardTag.photohunter],
    [ChallengeStatType.HARDWORKER_TASKS, CardTag.hardworker],
]);
