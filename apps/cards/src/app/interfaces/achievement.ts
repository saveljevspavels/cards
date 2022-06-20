export interface Achievement {
    id: string;
    title: string;
    text: string;
    value: number;
    tier: number;
    image: string;
    timesCompleted?: number;
}
