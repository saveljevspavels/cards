import CONST from '../../../../definitions/constants.json';
import * as RULES from '../../../../definitions/rules.json';
import STRAVA_CONFIG from '../../../../definitions/stravaConfig.json';

const baseUrl = 'http://104.248.43.193V-QRHuR&QsAX*p';

export const environment: any = {
    production: true,
    const: CONST,
    rules: RULES,
    stravaConfig: STRAVA_CONFIG,
    authReturnUrl: `${baseUrl}/login/return`,
    baseBE: `${baseUrl}:90/api`,
};
