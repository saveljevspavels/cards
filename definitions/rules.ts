import {AbilityKey} from "../apps/shared/interfaces/ability.interface";
import {BaseWorkout} from "../apps/shared/classes/athlete.class";

export const RULES = {
    FEATURED_CARD_ENABLED: false,
    DEFAULT_BASE_WORKOUT: <BaseWorkout>{
        run: {
            distance: 3000,
            average_speed: 2.08,
            time_3k: 1620,
            time_5k: 2700,
            time_10k: 5400
        },
        ride: {
            distance: 7000,
            average_speed: 5, // TODO: discuss
            time_10k: 2400,
            time_40k: 10800
        },
        walk: {
            distance: 3000
        },
        other: {
            distance: 5000,
            elapsed_time: 1800
        }
    },
    LEVEL_EXPERIENCE: [
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
    ],
    CARD_LEVELS: {
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
    FATIGUE: {
        MIN: 0,
        MAX: 99,
        BASE: 0,
        TIMED_RESTORE: 5
    },
    CARD_PER_FATIGUE_ACTIVATION_COST: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144],
    ENERGY: {
        MIN: 0,
        MAX: 99,
        BASE: 3,
        TIMED_RESTORE: 1
    },
    COINS: {
        BASE: 0,
        MIN: 0,
        MAX: 999,
        PER_ENERGY_CONVERSION: 3,
        FEATURED_CARD_POINT_CONVERSION: 2,
        BASE_UNLOCK_PRICE: 0,
        PER_LEVEL_PRICE: 5,
        ACTIVITY_BOOST_PRICE: 1
    },
    SCHEME: {
        BOARDS_NUMBER: 5,
        MAX_ACTIVE_CARDS: 3
    },
    PROGRESS_PRECISION: 1000,
    PROGRESSIVE_CHALLENGE: {
        ENABLED: true,
        HOURS: {
            FIRST_DAY: [0],
            REGULAR: [0]
        },
        MAX_ACTIVE: 6,
        MAX_QUEUED: 99,
        NEW_DAILY: 2,
        MIN_ACTIVITY_TIME: 900
    },
    STORE: {
        RESTOCK_HOURS: [0]
    },
    FEATURED_TASK_HOURS: {
        FIRST_DAY: [4, 12, 20],
        REGULAR: [4, 12, 20]
    },
    ENABLED_ABILITIES: [
        AbilityKey.REDUCE_BASE_WORKOUT,
        AbilityKey.EXPERIENCE_PER_TASK_BONUS,
        AbilityKey.FLAT_EXPERIENCE_BONUS,
        AbilityKey.BASE_TASK_EXPERIENCE_BONUS,
        AbilityKey.CARD_UNLOCK_DISCOUNT,
        AbilityKey.STORE_ENERGY_DISCOUNT,
        AbilityKey.STORE_CHEST_DISCOUNT,
        AbilityKey.BASIC_INCOME,
    ],
    ABILITY_BASE_WORKOUT_REDUCTION: 0.90,
    ABILITY_EXTRA_EXPERIENCE: 1,
    BASE_CARD_EXPERIENCE_REWARD: 1,
    ABILITY_FLAT_EXPERIENCE: 25,
    BASIC_INCOME_AMOUNT: 1,
    UNLOCK_DISCOUNT_AMOUNT: 1,
    STARTING_CARD: ''
}
