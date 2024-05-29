import {RESPONSES} from "./response-codes";
import fs from "fs";
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import {AbilityKey} from "../shared/interfaces/ability.interface";
import AthleteService from "./athlete.service";
import {Logger} from "winston";
import {ABILITIES} from "../../definitions/abilities";
import schedule from "node-schedule";
import {RULES} from "../../definitions/rules";
import {getRandomInt} from "./helpers/util";
import ScoreService from "./score.service";
import CardService from "./card.service";
import Athlete from "../shared/classes/athlete.class";
import CardFactory from "../shared/interfaces/card-factory.interface";
import ActivityService from "./activity.service";
import Game from "../cards/src/app/interfaces/game";
import {DateService} from "../shared/utils/date.service";
import {ProgressiveChallenge} from "../shared/interfaces/progressive-challenge.interface";

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
                await this.useAbility(athleteId, abilityKey);
            } catch (err) {
                res.status(400).send(err);
            }
            res.status(200).send();
        });
    }

    async useAbility(athleteId: string, abilityKey: AbilityKey) {
        const athlete = await this.athleteService.getAthlete(athleteId);
        const ability = ABILITIES.find(ability => ability.key === abilityKey);
        if(!ability) {
            this.logger.info(`Athlete ${athlete.name} tried to activate invalid ability: ${abilityKey}`);
            throw 'Invalid ability';
        }
        if(athlete.currencies.perks <= 0) {
            this.logger.info(`Athlete ${athlete.name} tried to activate ability ${abilityKey} without perks`);
            throw 'No abilities available';
        }

        athlete.currencies.perks -= 1;
        athlete.usedAbilities.push(abilityKey);
        this.athleteService.spendCoins(athlete, ability.coinsCost);
        this.athleteService.increaseFatigue(athlete, ability.energyCost);

        switch (abilityKey) {
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
            ability.value && await this.scoreService.addPoints(athleteId, ability.value),
            this.athleteService.updateAthlete(athlete)
        ]);
    }

    reduceBaseWorkout(distance: number): number {
        return Math.ceil((distance) * RULES.ABILITY_BASE_WORKOUT_REDUCTION);
    }
}
