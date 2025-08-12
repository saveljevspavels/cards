import { BOARD_KEY } from '../../../definitions/scheme';

export interface CardScheme {
    boards: CardSchemeBoard[]
}

export interface CardSchemeBoard {
    title: string;
    key: BOARD_KEY;
    color: string;
    icon: string;
    levels: CardSchemeLevel[];
}

export interface CardSchemeLevel {
    cards: string[]
}
