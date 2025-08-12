import {RESPONSES} from "./response-codes"
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import {RULES} from "../../definitions/rules";
import Athlete, {AthletePatch} from "../shared/classes/athlete.class";
import {Logger} from "winston";
import {of} from "rxjs";
import {Currencies} from "../shared/classes/currencies.class";
import {AbilityKey} from "../shared/interfaces/ability.interface";

export default class AthleteService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger
    ) {
        this.app.post(`${CONST.API_PREFIX}/update-base-workout`, async (req, res) => {
            if(!req.body.athleteIds.length) {
                res.status(400).send({response: RESPONSES.ERROR.INVALID_ATHLETE});
                return;
            }
            await this.updateBaseWorkoutsForAthletes(req.body.athleteIds, req.body.baseWorkout)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });

        this.app.post(`${CONST.API_PREFIX}/set-permissions`, async (req, res) => {
            await fireStoreService.setPermissions(req.body.athleteIds, req.body.permissions)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });

        this.app.post(`${CONST.API_PREFIX}/athlete/claim-base-reward`, async (req, res) => {
            const athleteId = res.get('athleteId');
            if(!athleteId) {
                res.status(400).send('Athlete Id missing');
                return;
            }
            const type = req.body?.type;
            if(!type) {
                res.status(400).send('Activity type missing');
                return;
            }
            await this.claimBaseReward(athleteId, type)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });
    }

    async claimBaseReward(athleteId: string, type: string) {
        const athlete = await this.getAthlete(athleteId);
        // @ts-ignore
        const reward = this.calculateBaseReward(athlete, type);
        if(!reward || reward.experience === 0) {
            return of();
        }
        const newProgress = {...athlete.baseCardProgress};
        // @ts-ignore
        newProgress[type] = parseInt(athlete.baseCardProgress[type], 10) % RULES.PROGRESS_PRECISION;
        athlete.addCurrencies(reward);
        athlete.baseCardProgress = newProgress;
        await this.updateAthlete(athlete);
        this.logger.info(`Athlete ${athlete.logName} claimed ${reward} for basic ${type}`);
    }

    calculateBaseReward(athlete: Athlete, type: string): Currencies {
        const base = RULES.BASE_CARD_EXPERIENCE_REWARD;
        const bonus = athlete.perks[AbilityKey.BASE_TASK_EXPERIENCE_BONUS] || 0;
        const typeBonus = athlete.perks[`base_${type}_experience_bonus`] || 0;
        return Currencies.withExperience(
            // @ts-ignore
            Math.floor(parseInt(athlete.baseCardProgress[type], 10) / RULES.PROGRESS_PRECISION)
            *
            (base + bonus + typeBonus)
        );
    }

    async saveAthlete(athlete: any) {
        const athleteExists = await this.fireStoreService.athleteCollection.exists(athlete.id.toString())
        let athleteInstance: Athlete;
        try {
            athleteInstance = this.createAthlete(athlete);
        } catch (e) {
            this.logger.error(`Error checking athlete existence: ${e}`);
            throw 'Error checking athlete existence';
        }
        if(!athleteExists) {
            await this.fireStoreService.athleteCollection.set(athlete.id.toString(), athleteInstance)
            this.logger.info(`Athlete ${athleteInstance.logName} saved`)
        } else {
            await this.fireStoreService.athleteCollection.update(athleteInstance.id.toString(), this.createAthletePatch(athleteInstance))
            this.logger.info(`Athlete ${athleteInstance.logName} logged in & updated`)
        }
    }

    async getAthlete(athleteId: string | number): Promise<Athlete> {
        const athlete = Athlete.fromJSONObject(await this.fireStoreService.athleteCollection.get(athleteId.toString()));
        if(!athlete) {
            this.logger.error(`Athlete ${athleteId} does not exist`);
            throw 'Athlete does not exist';
        } else {
            return athlete;
        }
    }

    async updateAthlete(athlete: Athlete) {
        await this.fireStoreService.athleteCollection.update(athlete.id.toString(), athlete.toJSONObject());
    }

    createAthlete(athlete: any): Athlete {
        return Athlete.new(athlete.id, athlete.firstname, athlete.lastname, athlete.profile);
    }

    createAthletePatch(athlete: any): AthletePatch {
        return {
            firstname: athlete.firstname,
            lastname: athlete.lastname,
            profile: athlete.profile,
            name: `${athlete.firstname} ${athlete.lastname}`,
        }
    }

    spendEnergy(athlete: Athlete, amount: number): void {
        if(amount === 0) {
            return;
        }

        try {
            athlete.spendEnergy(amount);
        } catch(e) {
            this.logger.info(`Athlete ${athlete.logName} can't spend ${amount} energy due to ${e}`);
            throw e;
        }

        this.logger.info(`Athlete ${athlete.logName} spent ${amount} energy, now ${athlete.currencies.energy}`)
    }

    increaseFatigue(athlete: Athlete, amount: number): void {
        if (amount === 0) {
            return;
        }
        try {
            athlete.increaseFatigue(amount);
        } catch (e) {
            this.logger.info(`Athlete ${athlete.logName} can't increase fatigue by ${amount} due to ${e}`);
            throw e;
        }

        this.logger.info(`Athlete ${athlete.logName} fatigue increased by ${amount}, now ${athlete.currencies.fatigue}`)
    }

    async decreaseFatigue(athlete: Athlete, amount: number): Promise<void> {
        const newFatigue = Math.max(athlete.currencies.energy - amount, RULES.FATIGUE.MIN)
        athlete.currencies.fatigue = newFatigue;
        await this.updateAthlete(athlete);
        this.logger.info(`Athlete ${athlete.logName} fatigue lowered by ${amount}, now ${newFatigue}`)
    }

    spendCoins(athlete: Athlete, amount: number) {
        if(amount === 0) {
            return;
        }
        try {
            athlete.spendCoins(amount);
        } catch (e) {
            this.logger.info(`Athlete ${athlete.logName} don't have enough coins (${amount}) to spend. Has ${athlete.currencies.coins}`);
            throw 'Not enough coins';
        }
        this.logger.info(`Athlete ${athlete.logName} spent ${amount} coins, now ${athlete.currencies.coins - amount}`)
    }

    triggerPerks(athlete: Athlete) {
        const basicIncome = athlete.getPerkLevel(AbilityKey.BASIC_INCOME);
        if(basicIncome) {
            const amount = basicIncome * RULES.BASIC_INCOME_AMOUNT;
            athlete.addCurrencies(Currencies.withCoins(amount));
            this.logger.info(`Athlete ${athlete.logName} gained ${amount} coins from ${AbilityKey.BASIC_INCOME}, now ${athlete.currencies.coins}`)
        }
    }


    async updateBaseWorkoutsForAthletes(athleteIds: string[], baseWorkoutPatch: any): Promise<any> {
        for (const athleteId of athleteIds) {
            const athlete = await this.getAthlete(athleteId);
            this.updateBaseWorkout(athlete, baseWorkoutPatch);
            await this.updateAthlete(athlete);
        }
    }

    updateBaseWorkout(athlete: Athlete, baseWorkoutPatch: any): void {
        athlete.updateBaseWorkout(baseWorkoutPatch);
        this.logger.info(`Base workout updated for ${athlete.logName} with ${JSON.stringify(baseWorkoutPatch)}`)
    }

    addExperience(athlete: Athlete, experience: number): void {
        if (experience === 0) {
            return;
        }
        const levelBefore = athlete.level;
        athlete.addExperience(experience);
        if(athlete.level > levelBefore) {
            this.logger.info(`Athlete ${athlete.logName} got ${experience} experience, leveled up to ${athlete.level}`)
        }
    }
}
