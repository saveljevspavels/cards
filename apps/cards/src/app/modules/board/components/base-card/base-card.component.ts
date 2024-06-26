import {Component, Input, OnChanges, OnInit} from '@angular/core';
import Athlete from "../../../../../../../shared/classes/athlete.class";
import {AthleteService} from "../../../../services/athlete.service";
import {Observable} from "rxjs";
import {UtilService} from "../../../../services/util.service";
import {StaticValidationService} from "../../../../../../../shared/services/validation.service";
import {ValidationService} from "../../../../services/validation.service";
import {RULES} from "../../../../../../../../definitions/rules";

@Component({
  selector: 'app-base-card',
  templateUrl: './base-card.component.html',
  styleUrls: ['./base-card.component.scss']
})
export class BaseCardComponent {
  public reward: number = RULES.COINS.BASE_CARD_REWARD;

  @Input() remainderActivity: any;

  public athlete$: Observable<Athlete | null> = this.athleteService.me;

  constructor(
      private athleteService: AthleteService
  ) { }

  claimBaseReward(type: string) {
    this.athleteService.claimBaseReward(type).subscribe();
  }

}
