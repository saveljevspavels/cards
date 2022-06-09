export default interface CardFactory {
    id: string;
    image: string;
    title: string;
    progression: Progression;
    cards: {
        tier: number;
        value: number;
        description: number;
        validation: CardValidation;
        usesToProgress: number;
    }[]
}

export type Progression = 'chain' | 'tiers' | 'flat' | 'none'

export type CardValidation = {
    property: string;
    comparator: 'greater' | 'less' | 'equals' | 'in' | 'notIn';
    value: number;
}
