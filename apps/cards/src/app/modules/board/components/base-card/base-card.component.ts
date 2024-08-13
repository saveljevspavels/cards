import {Component, Input} from '@angular/core';
import Athlete from "../../../../../../../shared/classes/athlete.class";
import {AthleteService} from "../../../../services/athlete.service";
import {Observable} from "rxjs";
import {RULES} from "../../../../../../../../definitions/rules";
import {Validator} from "../../../../../../../shared/classes/card.class";
import {CONST} from "../../../../../../../../definitions/constants";
import {Activity} from "../../../../../../../shared/interfaces/activity.interface";
import {AbilityKey} from "../../../../../../../shared/interfaces/ability.interface";

@Component({
  selector: 'app-base-card',
  templateUrl: './base-card.component.html',
  styleUrls: ['./base-card.component.scss']
})
export class BaseCardComponent {
  protected readonly AbilityKey = AbilityKey;
  public reward: number = RULES.BASE_CARD_EXPERIENCE_REWARD;

  @Input() remainderActivity: Activity;

  public athlete$: Observable<Athlete | null> = this.athleteService.me;

  constructor(
      private athleteService: AthleteService
  ) { }

  claimBaseReward(type: string) {
    this.athleteService.claimBaseReward(type).subscribe();
  }
}
