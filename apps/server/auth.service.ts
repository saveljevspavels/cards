import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import {STRAVA_CONFIG} from "../../definitions/stravaConfig";
import {Logger} from "winston";
import AthleteService from "./athlete.service";
import {AuthHelper} from "./helpers/auth.helper";

export default class AuthService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger,
        private athleteService: AthleteService
    ) {
        this.app.get(`${CONST.API_PREFIX}/auth/url`, async (req, res) => {
            res.status(200).send({
                url: `${CONST.STRAVA_BASE}/oauth/authorize?client_id=${STRAVA_CONFIG.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${req.query.returnUrl}?exchange_token&approval_prompt=force&scope=${STRAVA_CONFIG.REQUIRED_PERMISSIONS}`
            });
        });

        this.app.post(`${CONST.API_PREFIX}/auth/token`, async (req, res) => {
            const data = req.body;
            let jwt = '';
            if(data) {
                jwt = AuthHelper.createJwt(data, data.athlete?.id?.toString() || data.athleteId);
                if(data.athlete) {
                    await this.athleteService.saveAthlete(data.athlete);
                }
            }

            res.status(200).send({
                jwt
            });
        });
    }
}
