import {AbilityKey} from "../apps/shared/interfaces/ability.interface";
import {BaseWorkout} from "../apps/shared/classes/athlete.class";

export const RULES = {
    FEATURED_CARD_ENABLED: false,
    DEFAULT_BASE_WORKOUT: <BaseWorkout>{
        run: {
            distance: 3000,
            average_speed: 2.56,
            time_3k: 1620,
            time_5k: 2700,
            time_10k: 5400
        },
        ride: {
            distance: 8000,
            average_speed: 5,
            time_10k: 2400,
            time_40k: 10800
        },
        walk: {
            distance: 4000
        },
        other: {
            distance: 5000,
            elapsed_time: 1800
        }
    },
    LEVEL_EXPERIENCE: [
        20, 20, 20, 20, 20,
        30, 30, 30, 30, 30,
        40, 40, 40, 40, 40,
        50, 50, 50, 50, 50,
        60, 60, 60, 60, 60,
        70, 70, 70, 70, 70,
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
        MAX: 10,
        BASE: 3,
        TIMED_RESTORE: 1
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
        ACTIVITY_BOOST_PRICE: 1
    },
    SCHEME: {
        BOARDS_NUMBER: 3,
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
        NEW_DAILY: 2
    },
    FEATURED_TASK_HOURS: {
        FIRST_DAY: [4, 12, 20],
        REGULAR: [4, 12, 20]
    },
    ENABLED_ABILITIES: [
        // AbilityKey.BUY_ENERGY_FULL,
        // AbilityKey.BUY_ENERGY,
        // AbilityKey.BUY_POINT,
        // AbilityKey.BUY_3_POINTS,
        // AbilityKey.REDUCE_BASE_WORKOUT,
        // AbilityKey.SELL_ENERGY_FULL,
        // AbilityKey.ENERGY_TO_COINS,

        AbilityKey.REDUCE_WALK_WORKOUT,
        AbilityKey.REDUCE_RUN_WORKOUT,
        AbilityKey.REDUCE_RIDE_WORKOUT,
        AbilityKey.REDUCE_OTHER_WORKOUT,
        AbilityKey.EXPERIENCE_PER_TASK_BONUS,
        AbilityKey.SEE_FUTURE_CHALLENGE,
        AbilityKey.FLAT_EXPERIENCE_BONUS,
        AbilityKey.TASK_QUEUE_SIZE_BONUS,
        AbilityKey.BASE_WALK_EXPERIENCE_BONUS,
        AbilityKey.BASE_RUN_EXPERIENCE_BONUS,
        AbilityKey.BASE_RIDE_EXPERIENCE_BONUS,
        AbilityKey.BASE_OTHER_EXPERIENCE_BONUS,
    ],
    ABILITY_BASE_WORKOUT_REDUCTION: 0.9,
    ABILITY_EXTRA_EXPERIENCE: 1,
    ABILITY_FLAT_EXPERIENCE: 25,
    STARTING_CARD: ''
}
