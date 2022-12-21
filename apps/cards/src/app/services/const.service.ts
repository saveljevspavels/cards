import {Injectable} from "@angular/core";
import * as CONST from 'definitions/constants.json';
import * as RULES from 'definitions/rules.json';
import * as STRAVA_CONFIG from 'definitions/stravaConfig.json';
import * as MAP_CONFIG from 'definitions/mapConfig.json';

@Injectable({
    providedIn: 'root'
})
export class ConstService {
    static CONST = CONST;
    static RULES = RULES;
    static STRAVA_CONFIG = STRAVA_CONFIG;
    static MAP_CONFIG = MAP_CONFIG;
}
