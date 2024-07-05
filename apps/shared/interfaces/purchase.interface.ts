export interface Purchases {
    [date: string]: {
        [itemId: string]: number;
    }
}