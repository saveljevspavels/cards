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
    rewards: {
        points: number;
        coins: number;
        experience: number;
    },
    evaluateImmediate: boolean;
}

export enum ChallengeStatType {
    DISTANCE = "DISTANCE",
    BIRD_TASKS = "BIRD_TASKS",
    ANIMAL_TASKS = "ANIMAL_TASKS",
    WANDERER_TASKS = "WANDERER_TASKS",
    DISTANCE_TASKS = "DISTANCE_TASKS",
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
}

export const ChallengeStatTagMap: Map<ChallengeStatType, CardTag> = new Map([
    [ChallengeStatType.BIRD_TASKS, CardTag.bird],
    [ChallengeStatType.ANIMAL_TASKS, CardTag.animal],
    [ChallengeStatType.WANDERER_TASKS, CardTag.wanderer],
    [ChallengeStatType.DISTANCE_TASKS, CardTag.distance],
    [ChallengeStatType.MULTITASKER_TASKS, CardTag.multitasker],
    [ChallengeStatType.PHOTOHUNTER_TASKS, CardTag.photohunter],
    [ChallengeStatType.HARDWORKER_TASKS, CardTag.hardworker],
]);
