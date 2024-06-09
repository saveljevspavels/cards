import {CardSnapshot} from "./card.interface";

export interface Activity {
    name: string;
    gameData: ActivityGameData;
    distance: number;
    elapsed_time: number;
    average_heartrate: number;
    moving_time: number;
    id: number;
    athlete: {
        id: number;
    },
    start_date: string;
    type: ActivityType;
    total_elevation_gain: number;
}

export interface ActivityGameData {
    cardIds: string[];
    cardSnapshots: CardSnapshot[];
    comments: string;
    status: ActivityStatus;
    submittedAt: string;
}

export enum ActivityStatus {
    NEW = "new",
    SUBMITTED = "submitted",
    REJECTED = "rejected",
    APPROVED = "approved",
    DELETED = "deleted"
}

export enum ActivityType {
    RUN = "run",
    RIDE = "ride",
    WALK = "walk",
    OTHER = "other",
}