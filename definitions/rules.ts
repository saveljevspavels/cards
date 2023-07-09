import {AbilityKey} from "../apps/shared/interfaces/ability.interface";

export const RULES = {
    HAND_SIZE: 3,
    DEFAULT_BASE_WORKOUT: {
        run: {
            distance: 4000,
            average_speed: 2.56,
            time_3k: 1620,
            time_5k: 2700,
            time_10k: 5400
        },
        ride: {
            distance: 10000,
            average_speed: 5,
            time_10k: 2400,
            time_40k: 10800
        },
        walk: {
            distance: 3500
        },
        other: {
            distance: 5000,
            elapsed_time: 1800
        }
    },
    LEVELS: {
        0: {
            min: 1,
            max: 2
        },
        1: {
            min: 3,
            max: 4
        },
        2: {
            min: 5,
            max: 6
        },
        3: {
            min: 7,
            max: 8
        },
        4: {
            min: 9,
            max: 100
        }
    },
    ESTIMATION_ACCURACY: {
        distance: 1000,
        average_speed: 0.001
    },
    UPDATABLE_PROPERTIES: [
        "time_3k",
        "time_5k",
        "time_10k",
        "time_40k"
    ],
    UPDATABLE_PROPERTIES_DELTA: {
        time_3k: 30,
        time_5k: 60,
        time_10k: 90,
        time_40k: 240
    },
    QUEUE: {
        LENGTH: 7,
        CARDS_TO_SHIFT: 4
    },
    CARD_VALUE_STEP: 1,
    CARD_VALUE_MIN: 1,
    CARD_VALUE_MAX: 10,
    MAX_CARDS_SUBMIT: 4,
    ENERGY: {
        MIN: 0,
        MAX: 3,
        BASE: 3,
        TIMED_RESTORE: 3
    },
    COINS: {
        BASE: 0,
        MIN: 0,
        MAX: 999,
        PER_ENERGY_CONVERSION: 2,
        BASE_CARD_REWARD: 1,
        PER_LEVEL_PRICE: 5
    },
    SCHEME: {
        BOARDS_NUMBER: 3,
        MAX_ACTIVE_CARDS: 3
    },
    PROGRESS_PRECISION: 1000,
    FEATURED_TASK_HOURS: [4, 12, 20],
    ENABLED_ABILITIES: [
        AbilityKey.BUY_ENERGY_FULL,
        AbilityKey.BUY_ENERGY,
        AbilityKey.BUY_POINT,
        AbilityKey.REDUCE_BASE_WORKOUT,
        AbilityKey.RESET_CARD,
        AbilityKey.SELL_ENERGY_FULL,
        AbilityKey.ENERGY_TO_COINS
    ],
    ABILITIES: [
        {
            title: 'Reset Task',
            key: AbilityKey.RESET_CARD,
            description: 'You can reset any played card so it could be played again',
            value: 0,
            energyCost: 0,
            energyReward: 0,
            coinsCost: 10,
            coinsReward: 0,
        },
        {
            title: 'Victory point',
            key: AbilityKey.BUY_POINT,
            description: 'Immediately get 1 victory point',
            value: 1,
            energyCost: 0,
            energyReward: 0,
            coinsCost: 10,
            coinsReward: 0,
        },
        {
            title: 'Rest Day',
            key: AbilityKey.SELL_ENERGY_FULL,
            description: 'Lose full energy to immediately get 3 victory points',
            value: 3,
            energyCost: 3,
            energyReward: 0,
            coinsCost: 0,
            coinsReward: 0,
        },
        {
            title: 'Energy Shot',
            key: AbilityKey.BUY_ENERGY,
            description: 'Immediately restore 1 energy',
            value: 0,
            energyCost: 0,
            energyReward: 1,
            coinsCost: 10,
            coinsReward: 0,
        },
        {
            title: 'Energy Boost',
            key: AbilityKey.BUY_ENERGY_FULL,
            description: 'Immediately restore full energy',
            value: 0,
            energyCost: 0,
            energyReward: 3,
            coinsCost: 25,
            coinsReward: 0,
        },
        {
            title: 'All In',
            key: AbilityKey.ENERGY_TO_COINS,
            description: 'Spend full energy to get 20 coins',
            value: 0,
            energyCost: 3,
            energyReward: 0,
            coinsCost: 0,
            coinsReward: 20,
        },
        {
            title: 'Go Easy',
            key: AbilityKey.REDUCE_BASE_WORKOUT,
            description: 'Reduce distance requirements for most of the tasks by 10%',
            value: 0,
            energyCost: 0,
            energyReward: 0,
            coinsCost: 30,
            coinsReward: 0,
        }
    ]
}
