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
        PER_ENERGY_CONVERSION: 3,
        FEATURED_CARD_POINT_CONVERSION: 2,
        BASE_CARD_REWARD: 1,
        BASE_UNLOCK_PRICE: 0,
        PER_LEVEL_PRICE: 5,
    },
    SCHEME: {
        BOARDS_NUMBER: 3,
        MAX_ACTIVE_CARDS: 3
    },
    PROGRESS_PRECISION: 1000,
    FEATURED_TASK_HOURS: {
        FIRST_DAY: [4, 12, 20],
        REGULAR: [4, 12, 20]
    },
    ENABLED_ABILITIES: [
        AbilityKey.BUY_ENERGY_FULL,
        AbilityKey.BUY_ENERGY,
        AbilityKey.BUY_POINT,
        AbilityKey.BUY_3_POINTS,
        AbilityKey.REDUCE_BASE_WORKOUT,
        // AbilityKey.SELL_ENERGY_FULL,
        // AbilityKey.ENERGY_TO_COINS
    ],
    ABILITY_BASE_WORKOUT_REDUCTION: 0.9,
    STARTING_CARD: ''
}
