export default interface CardFactory {
    id: string;
    image: string;
    title: string;
    activityTypes: string[];
    progression: Progression;
    cards: {
        tier: number;
        value: number;
        description: number;
        validation: CardValidation;
        usesToProgress: number;
    }[]
}

export type Progression = 'tiers' | 'flat' | 'none'

export type CardValidation = {
    property: string;
    comparator: 'greater' | 'less' | 'equals';
    value: number;
}
