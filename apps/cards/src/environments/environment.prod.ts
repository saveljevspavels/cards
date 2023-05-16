import {CONST} from '../../../../definitions/constants';
import {RULES} from '../../../../definitions/rules';
import {STRAVA_CONFIG} from '../../../../definitions/stravaConfig';

const baseUrl = 'http://kurkudos.lv';

export const environment: any = {
    production: true,
    const: CONST,
    rules: RULES,
    stravaConfig: STRAVA_CONFIG,
    authReturnUrl: `${baseUrl}/login/return`,
    baseBE: `${baseUrl}/api`,
};
