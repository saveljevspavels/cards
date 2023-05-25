import {RESPONSES} from "./response-codes"
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import {RULES} from "../../definitions/rules";
import Athlete, {AthletePatch} from "../shared/interfaces/athlete.interface";
import {Logger} from "winston";

export default class AthleteService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger
    ) {
        this.app.post(`${CONST.API_PREFIX}update-base-workout`, async (req, res) => {
            if(!req.body.athleteIds.length) {
                res.status(400).send({response: RESPONSES.ERROR.INVALID_ATHLETE});
                return;
            }
            await fireStoreService.updateBaseWorkout(req.body.athleteIds, req.body.baseWorkout)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });

        this.app.post(`${CONST.API_PREFIX}set-permissions`, async (req, res) => {
            await fireStoreService.setPermissions(req.body.athleteIds, req.body.permissions)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });
    }

    async saveAthlete(athlete: any) {
        const athleteDoc = this.fireStoreService.athleteCollection.doc(athlete.id.toString())
        const athleteExists = (await athleteDoc.get()).exists
        if(!athleteExists) {
            await athleteDoc.set(this.createAthlete(athlete))
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} saved`)
        } else {
            await athleteDoc.update(this.createAthletePatch(athlete))
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} logged in & updated`)
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
            permissions: ['default'],
            achievements: [],
            energy: RULES.ENERGY.BASE,
            coins: RULES.COINS.BASE
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
}
