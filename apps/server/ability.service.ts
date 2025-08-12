import {Express} from "express";
import {CONST} from "../../definitions/constants";
import {Ability, AbilityKey} from "../shared/interfaces/ability.interface";
import AthleteService from "./athlete.service";
import {Logger} from "winston";
import {ABILITIES} from "../../definitions/abilities";
import {RULES} from "../../definitions/rules";
import {getRandomInt} from "./helpers/util";
import ScoreService from "./score.service";
import Athlete from "../shared/classes/athlete.class";
import {Currencies} from "../shared/classes/currencies.class";

export default class AbilityService {
    constructor(
        private app: Express,
        private logger: Logger,
        private athleteService: AthleteService,
        private scoreService: ScoreService,
    ) {
        app.post(`${CONST.API_PREFIX}/abilities/activate`,async (req, res) => {
            const abilityKey = req.body?.abilityKey;
            const athleteId = res.get('athleteId');
            if(!abilityKey || !athleteId) {
                res.status(400).send('Ability Key or Athlete Id missing');
                return;
            }
            try {
                await this.consumeAbility(athleteId, abilityKey);
            } catch (err) {
                res.status(400).send(err);
            }
            res.status(200).send();
        });

        app.post(`${CONST.API_PREFIX}/abilities/random`, async (req, res) => {
            const athleteId = res.get('athleteId');
            if(!athleteId) {
                res.status(400).send('Athlete Id missing');
                return;
            }
            try {
                const abilityKey = await this.consumeRandomAbility(athleteId);
                res.status(200).send({abilityKey});
            } catch (err) {
                res.status(400).send(err);
            }
        });

        app.post(`${CONST.API_PREFIX}/abilities/open-chest`, async (req, res) => {
            const athleteId = res.get('athleteId');
            if(!athleteId) {
                res.status(400).send('Athlete Id missing');
                return;
            }
            try {
                const rewards = await this.openChest(athleteId);
                res.status(200).send({rewards});
            } catch (err) {
                res.status(400).send(err);
            }
        });
    }

    async consumeRandomAbility(athleteId: string) {
        const athlete = await this.athleteService.getAthlete(athleteId);
        this.logger.info(`Athlete ${athlete.logName} is trying to consume random ability`);
        if(athlete.currencies.random_perk <= 0) {
            this.logger.info(`Athlete ${athlete.logName} don't have random perks to activate`);
            throw 'No random perks available';
        }
        const ability = this.getAbility(this.getRandomAbilityKey(athlete));
        athlete.currencies.random_perk -= 1;
        await this.activateAbility(athlete, ability);
        return ability.key;
    }

    getRandomAbilityKey(athlete: Athlete): AbilityKey {
        const availableAbilities = RULES.ENABLED_ABILITIES.filter(abilityKey => {
            const ability =  this.getAbility(abilityKey);
            return !ability.maxLevel || !athlete.perks[abilityKey] || athlete.perks[abilityKey] < ability.maxLevel
        });
        return availableAbilities[getRandomInt(availableAbilities.length)];
    }

    async consumeAbility(athleteId: string, abilityKey: AbilityKey) {
        const athlete = await this.athleteService.getAthlete(athleteId);
        this.logger.info(`Athlete ${athlete.logName} is trying to consume ability ${abilityKey}`);
        const ability = this.getAbility(abilityKey);
        if(athlete.currencies.perk <= 0) {
            this.logger.info(`Athlete ${athlete.logName} tried to activate ability ${abilityKey} without perks`);
            throw 'No perks available';
        }
        if(ability.maxLevel && athlete.perks[abilityKey] >= ability.maxLevel) {
            this.logger.info(`Athlete ${athlete.logName} tried to activate ability ${abilityKey}. Is at max level (${athlete.perks[abilityKey]})`);
            throw 'Perk at maximum level';
        }

        athlete.currencies.perk -= 1;
        await this.activateAbility(athlete, ability);
    }

    async activateAbility(athlete: Athlete, ability: Ability) {
        athlete.usedAbilities.push(ability.key);
        this.athleteService.spendCoins(athlete, ability.coinsCost);
        this.athleteService.spendEnergy(athlete, ability.energyCost);

        switch (ability.key) {
            case AbilityKey.REDUCE_BASE_WORKOUT:
                this.athleteService.updateBaseWorkout(
                    athlete,
                    {
                        run: {
                            distance: this.reduceBaseWorkout(athlete.baseWorkout.run.distance),
                        },
                        ride: {
                            distance: this.reduceBaseWorkout(athlete.baseWorkout.ride.distance),
                        },
                        walk: {
                            distance: this.reduceBaseWorkout(athlete.baseWorkout.walk.distance),
                        }
                    }
                )
                athlete.addPerk(ability.key);
                break;
            case AbilityKey.REDUCE_WALK_WORKOUT:
                this.athleteService.updateBaseWorkout(
                    athlete,
                    {
                        walk: {
                            distance: this.reduceBaseWorkout(athlete.baseWorkout.walk.distance),
                        }
                    }
                );
                break;
            case AbilityKey.REDUCE_RUN_WORKOUT:
                this.athleteService.updateBaseWorkout(
                    athlete,
                    {
                        run: {
                            distance: this.reduceBaseWorkout(athlete.baseWorkout.run.distance),
                        }
                    }
                );
                break;
            case AbilityKey.REDUCE_RIDE_WORKOUT:
                this.athleteService.updateBaseWorkout(
                    athlete,
                    {
                        ride: {
                            distance: this.reduceBaseWorkout(athlete.baseWorkout.ride.distance),
                        }
                    }
                );
                break;
            case AbilityKey.REDUCE_OTHER_WORKOUT:
                this.athleteService.updateBaseWorkout(
                    athlete,
                    {
                        other: {
                            elapsed_time: this.reduceBaseWorkout(athlete.baseWorkout.other.elapsed_time),
                        }
                    }
                );
                break;
            case AbilityKey.FLAT_EXPERIENCE_BONUS:
                this.athleteService.addExperience(athlete, RULES.ABILITY_FLAT_EXPERIENCE);
                break;
            case AbilityKey.RESET_CARD:
                break;
            default:
                athlete.addPerk(ability.key);
                break;
        }

        athlete.addCurrencies(new Currencies(
            ability.coinsReward,
            0,
            0,
            0,
            0,
            0,
            ability.energyReward,
        ));

        await Promise.all([
            ability.value && await this.scoreService.addPoints(athlete.id, ability.value),
            this.athleteService.updateAthlete(athlete)
        ]);
        this.logger.info(`Athlete ${athlete.logName} activated ability ${ability.key}`);
    }

    reduceBaseWorkout(distance: number): number {
        return Math.ceil((distance) * RULES.ABILITY_BASE_WORKOUT_REDUCTION);
    }

    getAbility(abilityKey: AbilityKey): Ability {
        const ability = ABILITIES.find(ability => ability.key === abilityKey);
        if(!ability) {
            this.logger.info(`Ability ${abilityKey} not found`);
            throw 'Ability not found';
        }
        return ability;
    }

    async openChest(athleteId: string) {
        const athlete: Athlete = await this.athleteService.getAthlete(athleteId);
        this.logger.info(`Athlete ${athlete.logName} is trying to open chest`);
        if (athlete.currencies.chest <= 0) {
            this.logger.info(`Athlete ${athlete.logName} tried to open chest without chests`);
            throw 'No chests available';
        }
        athlete.currencies.chest -= 1;
        const rewards = this.getChestRewards();
        athlete.addCurrencies(rewards);
        await Promise.all([
            this.athleteService.updateAthlete(athlete),
            rewards.points && this.scoreService.addPoints(athleteId, rewards.points)
        ])
        this.logger.info(`Athlete ${athlete.logName} opened chest and got ${rewards.toString()}`);
        return rewards;
    }

    getChestRewards(): Currencies {
        const reward = new Currencies();

        // Base coin reward
        reward.coins = 3 + getRandomInt(3); // 3-5

        const roll= getRandomInt(101);
        if(roll < 10) {
            reward.coins += 16 + getRandomInt(4);
        } else if(roll < 20) {
            reward.points = 1;
        } else if(roll < 40) {
            reward.perk = 1;
        } else if(roll < 65) {

            reward.random_perk = 1;
        } else {
            reward.special_task = 1;
        }
        return reward;
    }
}
