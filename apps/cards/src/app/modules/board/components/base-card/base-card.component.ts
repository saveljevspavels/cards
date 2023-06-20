import {Component, Input, OnChanges, OnInit} from '@angular/core';
import Athlete from "../../../../../../../shared/interfaces/athlete.interface";
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
export class BaseCardComponent implements OnChanges {
  public reward: number = RULES.COINS.BASE_CARD_REWARD;

  @Input() remainderActivity: any;

  public athlete$: Observable<Athlete | null> = this.athleteService.me;

  constructor(
      private athleteService: AthleteService
  ) { }

  ngOnChanges(): void {

  }

}
