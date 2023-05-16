import {Injectable} from "@angular/core";
import {CONST} from 'definitions/constants';
import {RULES} from 'definitions/rules';
import {STRAVA_CONFIG} from 'definitions/stravaConfig';
import {MAP_CONFIG} from 'definitions/mapConfig';

@Injectable({
    providedIn: 'root'
})
export class ConstService {
    static CONST = CONST;
    static RULES = RULES;
    static STRAVA_CONFIG = STRAVA_CONFIG;
    static MAP_CONFIG = MAP_CONFIG;
}
