export interface Ability {
    title: string;
    key: AbilityKey;
    description: string;
    value: number;
    energyCost: number;
    energyReward: number;
    coinsCost: number;
    coinsReward: number
}

export enum AbilityKey {
    REDUCE_WALK_WORKOUT = 'reduce_walk_workout',
    REDUCE_RUN_WORKOUT = 'reduce_run_workout',
    REDUCE_RIDE_WORKOUT = 'reduce_ride_workout',
    REDUCE_OTHER_WORKOUT = 'reduce_other_workout',
    EXPERIENCE_PER_TASK_BONUS = 'experience_per_task_bonus',
    SEE_FUTURE_CHALLENGE = 'see_future_challenge',
    FLAT_EXPERIENCE_BONUS = 'flat_experience_bonus',
    TASK_QUEUE_SIZE_BONUS = 'task_queue_size_bonus',
    BASE_WALK_EXPERIENCE_BONUS = 'base_walk_experience_bonus',
    BASE_RUN_EXPERIENCE_BONUS = 'base_run_experience_bonus',
    BASE_RIDE_EXPERIENCE_BONUS = 'base_ride_experience_bonus',
    BASE_OTHER_EXPERIENCE_BONUS = 'base_other_experience_bonus',
    BUY_POINT = 'buy_point',
    BUY_3_POINTS = 'buy_3_points',
    BUY_ENERGY = 'buy_energy',
    BUY_ENERGY_FULL = 'buy_energy_full',
    SELL_ENERGY_FULL = 'sell_energy_full',
    ENERGY_TO_COINS = 'energy_to_coins',
    RESET_CARD = 'reset_card',
    REDUCE_BASE_WORKOUT = 'reduce_base_workout',

}