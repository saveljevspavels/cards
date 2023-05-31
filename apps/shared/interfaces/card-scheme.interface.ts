export interface CardScheme {
    boards: CardSchemeBoard[]
}

export interface CardSchemeBoard {
    title: string;
    levels: CardSchemeLevel[];
}

export interface CardSchemeLevel {
    cards: string[]
}