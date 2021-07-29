export default interface Athlete {
    name: string;
    id: string;
    divisions: Division;
    permissions: string[];
}

export interface Division {
    RUN: number;
    RIDE: number;
}
