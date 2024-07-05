import {Currencies} from "../classes/currencies.class";

export interface StoreItem {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    rewards: Currencies;
}