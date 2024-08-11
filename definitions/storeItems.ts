import {StoreItem} from "../apps/shared/interfaces/store-item.interface";
import {Currencies} from "../apps/shared/classes/currencies.class";

export const STORE_ITEMS: StoreItem[] = [
    {
        id: "chest",
        name: "Chest",
        description: "Chest with valuable rewards",
        price: 25,
        imageUrl: "chest.png",
        rewards: Currencies.withChests(1)
    },
    {
        id: "energy_1",
        name: "Energy Drink",
        description: "Energy boost to complete more tasks",
        price: 5,
        imageUrl: "energy_drink.png",
        rewards: Currencies.withEnergy(1)
    },
    {
        id: "energy_2",
        name: "Foam Roller",
        description: "Energy boost to complete even more tasks",
        price: 10,
        imageUrl: "foam_roller.png",
        rewards: Currencies.withEnergy(1).withExperience(1)
    },
    {
        id: "energy_3",
        name: "Defibrillator",
        description: "When you refuse to stop",
        price: 15,
        imageUrl: "defibrillator.png",
        rewards: Currencies.withEnergy(1).withExperience(3)
    },
    {
        id: "perk",
        name: "Perk",
        description: "Special perk to help you out. You can choose whichever you like",
        price: 30,
        imageUrl: "",
        rewards: Currencies.withPerks(1)
    },
    {
        id: "random_perk",
        name: "Random Perk",
        description: "Special perk to help you out. I'm feeling lucky",
        price: 20,
        imageUrl: "",
        rewards: new Currencies(0, 0, 0, 0, 0, 1)
    }
]

export const AVAILABLE_ITEMS = [
    "chest",
    "energy_1",
    "energy_2",
    "energy_3"
]