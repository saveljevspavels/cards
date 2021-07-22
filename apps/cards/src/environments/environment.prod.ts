import CONST from '../../../../definitions/constants.json';
import STRAVA_CONFIG from '../../../../definitions/stravaConfig.json';
import {RULES} from "../app/app.module";

export const environment: any = {
    production: true,
    const: CONST,
    rules: RULES,
    stravaConfig: STRAVA_CONFIG,
    authReturnUrl: 'http://localhost:4600/login/return',
    baseBE: 'http://localhost:80/api',
};
