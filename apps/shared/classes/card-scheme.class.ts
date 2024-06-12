export class CardSchemeBoard {
    title: string;
    key: string;
    color: string;
    icon: string;
    levels: CardSchemeLevel[];

    constructor(title: string, key: string, color: string, icon: string, levels: CardSchemeLevel[]) {
        this.title = title;
        this.key = key;
        this.color = color;
        this.icon = icon;
        this.levels = levels;
    }
}

export interface CardScheme {
    boards: CardSchemeBoard[]
}

export interface CardSchemeLevel {
    cards: string[]
}