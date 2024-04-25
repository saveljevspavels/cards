import {AthleteService} from "./athlete.service";
import {StaticAthleteHelperService} from "../../../../shared/services/athlete.helper.service";
import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AthleteHelperService {

    constructor(private athleteService: AthleteService) {
    }

    getCardActivationCost(): any {
        return StaticAthleteHelperService.getCardActivationCost(this.athleteService.me.value?.fatigue || 0);
    }
}