import {ActivityType} from "./activity.interface";

export interface ProgressiveChallenge {
    id: string;
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
    }
}

export enum ChallengeStatType {
    DISTANCE = "DISTANCE",
    MOVING_TIME = "MOVING_TIME",
    ELAPSED_TIME = "ELAPSED_TIME",
    COMPLETED_TASKS = "COMPLETED_TASKS",
    BASIC_TASKS = "BASIC_TASKS",
    HEARTBEATS = "HEARTBEATS",
    ELEVATION_GAIN = "ELEVATION_GAIN",
}

