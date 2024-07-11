import {Component, Input, OnChanges, OnInit} from '@angular/core';
import Athlete from "../../../../../../../shared/classes/athlete.class";
import {AthleteService} from "../../../../services/athlete.service";
import {Observable} from "rxjs";
import {UtilService} from "../../../../services/util.service";
import {StaticValidationService} from "../../../../../../../shared/services/validation.service";
import {ValidationService} from "../../../../services/validation.service";
import {RULES} from "../../../../../../../../definitions/rules";
import {Validator} from "../../../../../../../shared/interfaces/card.interface";
import {CONST} from "../../../../../../../../definitions/constants";

@Component({
  selector: 'app-base-card',
  templateUrl: './base-card.component.html',
  styleUrls: ['./base-card.component.scss']
})
export class BaseCardComponent {
  public reward: number = RULES.BASE_CARD_EXPERIENCE_REWARD;

  @Input() remainderActivity: any;

  public DISTANCE_VALIDATORS: Validator[] = [
    {
      property: CONST.ACTIVITY_PROPERTIES.DISTANCE,
      comparator: CONST.COMPARATORS.GREATER,
      formula: CONST.ACTIVITY_PROPERTIES.DISTANCE
    },
    {
      property: CONST.ACTIVITY_PROPERTIES.TYPE,
      comparator: CONST.COMPARATORS.IN,
      formula: 'run,walk,ride'
    }
  ];
  public TIME_VALIDATORS: Validator[] = [
    {
      property: CONST.ACTIVITY_PROPERTIES.ELAPSED_TIME,
      comparator: CONST.COMPARATORS.GREATER,
      formula: CONST.ACTIVITY_PROPERTIES.ELAPSED_TIME
    },
    {
      property: CONST.ACTIVITY_PROPERTIES.TYPE,
      comparator: CONST.COMPARATORS.IN,
      formula: 'other'
    }
  ];

  public athlete$: Observable<Athlete | null> = this.athleteService.me;

  constructor(
      private athleteService: AthleteService
  ) { }

  claimBaseReward() {
    this.athleteService.claimBaseReward("combined").subscribe();
  }
}
