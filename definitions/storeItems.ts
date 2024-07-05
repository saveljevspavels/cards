import {StoreItem} from "../apps/shared/interfaces/store-item.interface";
import {Currencies} from "../apps/shared/classes/currencies.class";

export const STORE_ITEMS: StoreItem[] = [
    {
        id: "chest",
        name: "Chest",
        description: "Chest with valuable rewards",
        price: 25,
        imageUrl: "image",
        rewards: Currencies.withChests(1)
    },
    {
        id: "energy_1",
        name: "Energy Drink",
        description: "Energy boost to complete more tasks",
        price: 5,
        imageUrl: "image",
        rewards: Currencies.withEnergy(1)
    },
    {
        id: "energy_2",
        name: "Foam Roller",
        description: "Energy boost to complete even more tasks",
        price: 10,
        imageUrl: "image",
        rewards: Currencies.withChests(1).withExperience(1)
    },
    {
        id: "energy_3",
        name: "Defibrillator",
        description: "When you refuse to stop",
        price: 15,
        imageUrl: "image",
        rewards: Currencies.withChests(1).withExperience(3)
    }
]