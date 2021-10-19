export default interface Athlete {
    name: string;
    id: string;
    baseWorkout: BaseWorkout;
    permissions: string[];
}

export interface BaseWorkout {
    distance: number;
    pace: number;
}
