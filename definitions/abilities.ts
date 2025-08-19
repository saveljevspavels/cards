import {Ability, AbilityKey} from "../apps/shared/interfaces/ability.interface";
import {RULES} from "./rules";

export const ABILITIES: Ability[] =
[
    {
        image: 'assets/perks/pirate.svg',
        title: 'Pirate',
        key: AbilityKey.STORE_CHEST_DISCOUNT,
        description: 'Reduces chest price in store by 4 per perk level',
        value: 0,
        energyCost: 0,
        energyReward: 0,
        coinsCost: 0,
        coinsReward: 0,
        maxLevel: 2
    },
    {
        image: 'assets/perks/task_master.svg',
        title: 'Task Master',
        key: AbilityKey.EXPERIENCE_PER_TASK_BONUS,
        description: 'Each completed task gives 2 extra tokens per perk level',
        value: 0,
        energyCost: 0,
        energyReward: 0,
        coinsCost: 0,
        coinsReward: 0,
        maxLevel: 2
    },
    {
        image: 'assets/perks/perpetuum_mobile.svg',
        title: 'Perpetuum mobile',
        key: AbilityKey.STORE_ENERGY_DISCOUNT,
        description: 'Reduces Energy Drink price in store by 1 per perk level',
        value: 0,
        energyCost: 0,
        energyReward: 0,
        coinsCost: 0,
        coinsReward: 0,
        maxLevel: 2
    },
    {
        image: 'assets/perks/breakthrough.svg',
        title: 'Take it Easy',
        key: AbilityKey.REDUCE_BASE_WORKOUT,
        description: 'Reduce the distance requirements for most of the tasks by 10% per perk level',
        value: 0,
        energyCost: 0,
        energyReward: 0,
        coinsCost: 0,
        coinsReward: 0,
        maxLevel: 2
    },
    {
        image: 'assets/perks/lock_&_stock.svg',
        title: 'Lock & Stock',
        key: AbilityKey.CARD_UNLOCK_DISCOUNT,
        description: 'Reduces task unlock price by 1 per perk level',
        value: 0,
        energyCost: 0,
        energyReward: 0,
        coinsCost: 0,
        coinsReward: 0,
        maxLevel: 2
    },
    {
        image: 'assets/perks/basic_income.svg',
        title: 'Universal Basic Income',
        key: AbilityKey.BASIC_INCOME,
        description: 'You get 1 coin per perk level each midnight',
        value: 0,
        energyCost: 0,
        energyReward: 0,
        coinsCost: 0,
        coinsReward: 0,
        maxLevel: 2
    },
    {
        image: 'assets/perks/based.svg',
        title: 'Based',
        key: AbilityKey.BASE_TASK_EXPERIENCE_BONUS,
        description: 'Each completed Basic Task gives you 1 extra token per perk level',
        value: 0,
        energyCost: 0,
        energyReward: 0,
        coinsCost: 0,
        coinsReward: 0,
        maxLevel: 2
    },
    {
        image: 'assets/perks/breakthrough.svg',
        title: 'Breakthrough',
        key: AbilityKey.FLAT_EXPERIENCE_BONUS,
        description: `Immediately get ${RULES.ABILITY_FLAT_EXPERIENCE} tokens`,
        value: 0,
        energyCost: 0,
        energyReward: 0,
        coinsCost: 0,
        coinsReward: 0,
        maxLevel: 0
    },
]
