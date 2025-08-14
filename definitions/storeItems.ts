import {StoreItem} from "../apps/shared/interfaces/store-item.interface";
import {Currencies} from "../apps/shared/classes/currencies.class";
import {AbilityKey} from "../apps/shared/interfaces/ability.interface";

export const STORE_ITEMS: StoreItem[] = [
    {
        id: "chest",
        name: "Chest",
        description: "Chest with valuable rewards inside",
        price: 20,
        discount: 4,
        discountBy: AbilityKey.STORE_CHEST_DISCOUNT,
        imageUrl: "chest.png",
        rewards: Currencies.withChests(1)
    },
    {
        id: "energy_1",
        name: "Energy Drink",
        description: "Energy boost to complete more tasks",
        price: 7,
        discount: 1,
        discountBy: AbilityKey.STORE_ENERGY_DISCOUNT,
        imageUrl: "energy_drink.png",
        rewards: Currencies.withEnergy(1)
    },
    {
        id: "energy_2",
        name: "Foam Roller",
        description: "Energy boost to complete even more tasks",
        price: 10,
        imageUrl: "foam_roller.png",
        rewards: Currencies.withEnergy(1).withExperience(3)
    },
    {
        id: "energy_3",
        name: "Defibrillator",
        description: "When you refuse to stop",
        price: 13,
        imageUrl: "defibrillator.png",
        rewards: Currencies.withEnergy(1).withExperience(10)
    },
    {
        id: "perk",
        name: "Perk",
        description: "Special perk to help you out. You can choose whichever you like",
        price: 30,
        imageUrl: "perk.png",
        rewards: Currencies.withPerks(1)
    },
    {
        id: "random_perk",
        name: "Random Perk",
        description: "Special perk to help you out. I'm feeling lucky",
        price: 20,
        imageUrl: "random_perk.png",
        rewards: new Currencies(0, 0, 0, 0, 0, 1)
    }
]

export const AVAILABLE_ITEMS = [
    "chest",
    "energy_1",
    "energy_2",
    "energy_3"
]
