export interface CardScheme {
    boards: CardSchemeBoard[]
}

export interface CardSchemeBoard {
    title: string;
    key: string;
    color: string;
    icon: string;
    levels: CardSchemeLevel[];
}

export interface CardSchemeLevel {
    cards: string[]
}