export default interface Card {
    title: string;
    image: '';
    tier: number;
    id: string;
    description: string;
    value: number;
    cardUses: CardUses;
    factoryId: string;
    activityTypes: string[];
}

export interface CardUses {
    self: number;
    total: number;
    usesToProgress: number;
}
