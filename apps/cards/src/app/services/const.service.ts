import {Injectable} from "@angular/core";
import * as CONST from 'definitions/constants.json';
import * as RULES from 'definitions/rules.json';
import * as STRAVA_CONFIG from 'definitions/stravaConfig.json';

@Injectable({
    providedIn: 'root'
})
export class ConstService {
    static CONST = CONST;
    static RULES = RULES;
    static STRAVA_CONFIG = STRAVA_CONFIG;
}
