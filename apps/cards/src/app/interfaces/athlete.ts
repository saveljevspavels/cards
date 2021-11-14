export default interface Athlete {
    name: string;
    id: string;
    baseWorkout: BaseWorkout;
    permissions: string[];
}

export interface BaseWorkout {
    distance: number;
    average_speed: number;
    time_3k: number;
    time_5k: number;
    time_10k: number;
    time_40k: number;
}
