import {CONST} from '../../../../definitions/constants';
import {RULES} from '../../../../definitions/rules';
import {STRAVA_CONFIG} from '../../../../definitions/stravaConfig';

export const environment: any = {
    production: true,
    const: CONST,
    rules: RULES,
    stravaConfig: STRAVA_CONFIG,
    authReturnUrl: 'http://localhost:4600/login/return',
    baseBE: 'http://localhost:3000/api',
};
