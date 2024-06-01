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
        this.logger.info(`Athlete ${athleteId} is trying to consume random ability`);
        const athlete = await this.athleteService.getAthlete(athleteId);
        if(athlete.currencies.random_perks <= 0) {
            this.logger.info(`Athlete ${athlete.name} don't have random perks to activate`);
            throw 'No random perks available';
        }
        const ability = this.getAbility(this.getRandomAbilityKey());
        athlete.currencies.random_perks -= 1;
        await this.activateAbility(athlete, ability);
        return ability.key;
    }

    getRandomAbilityKey(): AbilityKey {
        return RULES.ENABLED_ABILITIES[getRandomInt(RULES.ENABLED_ABILITIES.length)];
    }

    async consumeAbility(athleteId: string, abilityKey: AbilityKey) {
        this.logger.info(`Athlete ${athleteId} is trying to consume ability ${abilityKey}`);
        const athlete = await this.athleteService.getAthlete(athleteId);
        const ability = this.getAbility(abilityKey);
        if(athlete.currencies.perks <= 0) {
            this.logger.info(`Athlete ${athlete.name} tried to activate ability ${abilityKey} without perks`);
            throw 'No abilities available';
        }

        athlete.currencies.perks -= 1;
        await this.activateAbility(athlete, ability);
    }

    async activateAbility(athlete: Athlete, ability: Ability) {
        athlete.usedAbilities.push(ability.key);
        this.athleteService.spendCoins(athlete, ability.coinsCost);
        this.athleteService.increaseFatigue(athlete, ability.energyCost);

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
            case AbilityKey.BASE_WALK_EXPERIENCE_BONUS:
                athlete.addPerk(AbilityKey.BASE_WALK_EXPERIENCE_BONUS);
                break;
            case AbilityKey.BASE_RUN_EXPERIENCE_BONUS:
                athlete.addPerk(AbilityKey.BASE_RUN_EXPERIENCE_BONUS);
                break;
            case AbilityKey.BASE_RIDE_EXPERIENCE_BONUS:
                athlete.addPerk(AbilityKey.BASE_RIDE_EXPERIENCE_BONUS);
                break;
            case AbilityKey.BASE_OTHER_EXPERIENCE_BONUS:
                athlete.addPerk(AbilityKey.BASE_OTHER_EXPERIENCE_BONUS);
                break;
            case AbilityKey.EXPERIENCE_PER_TASK_BONUS:
                athlete.addPerk(AbilityKey.EXPERIENCE_PER_TASK_BONUS);
                break;
            case AbilityKey.SEE_FUTURE_CHALLENGE:
                athlete.addPerk(AbilityKey.SEE_FUTURE_CHALLENGE);
                break;
            case AbilityKey.TASK_QUEUE_SIZE_BONUS:
                athlete.addPerk(AbilityKey.TASK_QUEUE_SIZE_BONUS);
                break;
            case AbilityKey.FLAT_EXPERIENCE_BONUS:
                this.athleteService.addExperience(athlete, RULES.ABILITY_FLAT_EXPERIENCE);
                break;
            case AbilityKey.RESET_CARD:
                break;
        }

        this.athleteService.spendCoins(athlete, -ability.coinsReward);
        this.athleteService.addEnergy(athlete, ability.energyReward);

        await Promise.all([
            ability.value && await this.scoreService.addPoints(athlete.id, ability.value),
            this.athleteService.updateAthlete(athlete)
        ]);
        this.logger.info(`Athlete ${athlete.name} activated ability ${ability.key}`);
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
        this.logger.info(`Athlete ${athleteId} is trying to open chest`);
        const athlete: Athlete = await this.athleteService.getAthlete(athleteId);
        if (athlete.currencies.chests <= 0) {
            this.logger.info(`Athlete ${athlete.name} tried to open chest without chests`);
            throw 'No chests available';
        }
        athlete.currencies.chests -= 1;
        const rewards = this.getChestRewards();
        athlete.addCurrencies(rewards);
        await Promise.all([
            this.athleteService.updateAthlete(athlete),
            rewards.points && this.scoreService.addPoints(athleteId, rewards.points)
        ])
        this.logger.info(`Athlete ${athlete.name} opened chest and got ${rewards.toString()}`);
        return rewards;
    }

    getChestRewards(): Currencies {
        const reward = new Currencies();

        // Base coin reward
        reward.coins = 3 + getRandomInt(3); // 3-6

        const roll= getRandomInt(100);
        if(roll < 10) {
            reward.coins += 21 + getRandomInt(3);
        } else if(roll < 20) {
            reward.points = 1;
        } else if(roll < 30) {
            reward.perks = 1;
        } else if(roll < 65) {
            
            reward.random_perks = 1;
        } else {
            reward.special_tasks = 1;
        }
        return reward;
    }
}
