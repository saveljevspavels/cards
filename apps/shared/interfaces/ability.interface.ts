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
    BUY_POINT = 'buy_point',
    BUY_ENERGY = 'buy_energy',
    BUY_ENERGY_FULL = 'buy_energy_full',
    SELL_ENERGY_FULL = 'sell_energy_full',
    ENERGY_TO_COINS = 'energy_to_coins',
    RESET_CARD = 'reset_card',
    REDUCE_BASE_WORKOUT = 'reduce_base_workout'
}