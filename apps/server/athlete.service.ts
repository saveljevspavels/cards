import {RESPONSES} from "./response-codes"
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import {RULES} from "../../definitions/rules";
import Athlete, {AthletePatch} from "../shared/interfaces/athlete.interface";
import {Logger} from "winston";
import {of} from "rxjs";

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
            await fireStoreService.updateBaseWorkout(req.body.athleteIds, req.body.baseWorkout)
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
        const reward = Math.floor(parseInt(athlete.baseCardProgress[type], 10) / RULES.PROGRESS_PRECISION);
        if(!reward || reward === 0) {
            return of();
        }
        const newProgress = {...athlete.baseCardProgress};
        // @ts-ignore
        newProgress[type] = parseInt(athlete.baseCardProgress[type], 10) % RULES.PROGRESS_PRECISION;
        await this.fireStoreService.athleteCollection.update(
            athleteId,
            {
                coins: parseInt(String(athlete.coins), 10) + reward,
                baseCardProgress: newProgress
            }
        )
        this.logger.info(`Athlete ${athlete.name} claimed ${reward} coins for basic ${type}`);
    }

    async saveAthlete(athlete: any) {
        const athleteExists = await this.fireStoreService.athleteCollection.exists(athlete.id.toString())
        if(!athleteExists) {
            await this.fireStoreService.athleteCollection.set(athlete.id.toString(), this.createAthlete(athlete))
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} saved`)
        } else {
            await this.fireStoreService.athleteCollection.update(athlete.id.toString(), this.createAthletePatch(athlete))
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} logged in & updated`)
        }
    }

    async getAthlete(athleteId: string | number): Promise<Athlete> {
        const athlete = await this.fireStoreService.athleteCollection.get(athleteId.toString());
        if(!athlete) {
            this.logger.error(`Athlete ${athleteId} does not exist`);
            throw 'Athlete does not exist';
        } else {
            return athlete;
        }
    }

    createAthlete(athlete: any): Athlete {
        return {
            id: athlete.id.toString(),
            firstname: athlete.firstname,
            lastname: athlete.lastname,
            profile: athlete.profile,
            name: `${athlete.firstname} ${athlete.lastname}`,
            baseWorkout: RULES.DEFAULT_BASE_WORKOUT,
            permissions: [],
            achievements: [],
            energy: RULES.ENERGY.BASE,
            fatigue: RULES.FATIGUE.BASE,
            coins: RULES.COINS.BASE,
            experience: 0,
            level: 1,
            cards: {
                active: [],
                completed: [],
                finished: [],
            },
            baseCardProgress: {
                run: 0,
                ride: 0,
                walk: 0,
                other: 0,
            },
            unlocks: {},
            usedAbilities: []
        }
    }

    createAthletePatch(athlete: any): AthletePatch {
        return {
            firstname: athlete.firstname,
            lastname: athlete.lastname,
            profile: athlete.profile,
            name: `${athlete.firstname} ${athlete.lastname}`,
        }
    }

    async addEnergy(athlete: Athlete, value: number) {
        const excessEnergy = ((athlete.energy || 0) + value) - RULES.ENERGY.MAX;
        const newVal = Math.min((athlete.energy || 0) + value, RULES.ENERGY.MAX)
        await this.fireStoreService.athleteCollection.update(
            athlete.id.toString(),
            {
                energy: newVal,
                coins: (athlete.coins || 0) + (excessEnergy > 0 ? excessEnergy * RULES.COINS.PER_ENERGY_CONVERSION : 0)
            }
        )
        this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} restored ${value} energy, now ${newVal}, and ${(excessEnergy > 0 ? excessEnergy * RULES.COINS.PER_ENERGY_CONVERSION : 0)} coins`)
    }

    async spendEnergy(athlete: Athlete, amount: number) {
        if(athlete.energy < amount) {
            this.logger.info(`Athlete ${athlete.name} don't have enough energy (${amount}) to spend. Has ${athlete.energy}`);
            throw 'Not enough energy';
        }

        await this.fireStoreService.athleteCollection.update(
            athlete.id,
            {
                energy: athlete.energy - amount
            }
        )
        this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} spent ${amount} energy, now ${athlete.energy - amount}`)
    }

    async increaseFatigue(athlete: Athlete, amount: number): Promise<void> {
        if(athlete.fatigue >= RULES.FATIGUE.MAX) {
            this.logger.info(`Athlete ${athlete.name} fatigue is at max (${athlete.fatigue}). Can't increase`);
            throw 'Max. fatigue reached';
        }

        const newFatigue = parseInt(String(athlete.fatigue), 10) + parseInt(String(amount), 10);
        await this.fireStoreService.athleteCollection.update(
            athlete.id,
            {
                fatigue: newFatigue
            }
        )
        this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} fatigue increased by ${amount}, now ${newFatigue}`)
    }

    async decreaseFatigue(athlete: Athlete, amount: number): Promise<void> {
        const newFatigue = Math.max(athlete.energy - amount, RULES.FATIGUE.MIN)
        await this.fireStoreService.athleteCollection.update(
            athlete.id,
            {
                fatigue: newFatigue
            }
        )
        this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} fatigue lowered by ${amount}, now ${newFatigue}`)
    }

    async spendCoins(athlete: Athlete, amount: number) {
        if(athlete.coins < amount) {
            this.logger.info(`Athlete ${athlete.name} don't have enough coins (${amount}) to spend. Has ${athlete.coins}`);
            throw 'Not enough coins';
        }

        await this.fireStoreService.athleteCollection.update(
            athlete.id,
            {
                coins: athlete.coins - amount
            }
        )
        this.logger.info(`Athlete ${athlete.name} spent ${amount} coins, now ${athlete.coins - amount}`)
    }
}
