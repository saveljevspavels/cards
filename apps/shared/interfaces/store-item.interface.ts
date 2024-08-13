import {Currencies} from "../classes/currencies.class";
import {AbilityKey} from "./ability.interface";

export interface StoreItem {
    id: string;
    name: string;
    description: string;
    price: number;
    discount?: number;
    discountBy?: AbilityKey;
    imageUrl: string;
    rewards: Currencies;
}