import {Component, Input, OnChanges, OnInit, Output} from '@angular/core';
import {ValidationService} from "../../../../services/validation.service";
import {UtilService} from "../../../../services/util.service";
import {StaticValidationService} from "../../../../../../../shared/services/validation.service";
import {RULES} from "../../../../../../../../definitions/rules";

@Component({
  selector: 'app-circular-progress-bar',
  templateUrl: './circular-progress-bar.component.html',
  styleUrls: ['./circular-progress-bar.component.scss']
})
export class CircularProgressBarComponent implements OnChanges {

  @Input() type: string;
  @Input() activity: any;
  @Input() currentProgress: number;

  public active: boolean;
  public progress: number;
  public totalProgress: number;
  public currentValue: number;
  public baseValue: number;
  public newValue: number;
  public totalValue: number;
  public complete: boolean;

  constructor(
      private validationService: ValidationService
  ) { }

  ngOnChanges(): void {
    this.active = !this.activity || this.type === UtilService.normalizeActivityType(this.activity.type);
    this.baseValue = this.validationService.getBaseValue(this.type);
    this.currentValue = Math.floor((this.currentProgress * this.baseValue) / RULES.PROGRESS_PRECISION);
    this.newValue = this.active ? parseInt(this.activity && this.activity[StaticValidationService.baseActivityTypeMap.get(this.type) || ''] || 0,  10) : 0;
    this.totalValue = this.active ? this.newValue + this.currentValue : this.currentValue;
    this.progress = this.activity ? this.validationService.getBaseCardProgress(this.activity) : 0;
    this.totalProgress = this.active ? this.currentProgress + this.progress : 0;

    this.complete = !(this.active && this.activity) && this.currentProgress > RULES.PROGRESS_PRECISION;
  }

}
