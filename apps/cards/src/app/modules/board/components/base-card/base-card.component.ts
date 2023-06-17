import {Component, Input, OnChanges, OnInit} from '@angular/core';
import Athlete from "../../../../../../../shared/interfaces/athlete.interface";
import {AthleteService} from "../../../../services/athlete.service";
import {Observable} from "rxjs";
import {UtilService} from "../../../../services/util.service";
import {StaticValidationService} from "../../../../../../../shared/services/validation.service";
import {ValidationService} from "../../../../services/validation.service";

@Component({
  selector: 'app-base-card',
  templateUrl: './base-card.component.html',
  styleUrls: ['./base-card.component.scss']
})
export class BaseCardComponent implements OnChanges {

  @Input() remainderActivity: any;

  public athlete$: Observable<Athlete | null> = this.athleteService.me;
  public type: string;
  public value: number;
  public progress: number;

  constructor(
      private athleteService: AthleteService,
      private validationService: ValidationService
  ) { }

  ngOnChanges(): void {
    if(this.remainderActivity) {
      this.type = UtilService.normalizeActivityType(this.remainderActivity.type);
      this.value = this.remainderActivity[StaticValidationService.baseActivityTypeMap.get(this.type) || ''];
      this.progress = this.validationService.getBaseCardProgress(this.remainderActivity);
    }
  }

}
