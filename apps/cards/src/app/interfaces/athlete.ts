export default interface Athlete {
    name: string;
    id: string;
    baseWorkout: BaseWorkout;
    permissions: string[];
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
}
