import {Component, Input, OnChanges, OnInit, Output} from '@angular/core';
import {ValidationService} from "../../../../services/validation.service";
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
  @Input() monochrome = false;
  @Input() small = false;
  @Input() reward = 0;

  public active: boolean = true;
  public progress: number;
  public totalProgress: number;
  public currentValue: number;
  public baseValue: number;
  public newValue: number;
  public totalValue: number;
  public complete: boolean;
  public activityType: string;

  public radius: number;
  public strokeWidth: number;
  public strokeColor: string;
  constructor(
      private validationService: ValidationService,
  ) { }

  ngOnChanges(): void {
    this.activityType = StaticValidationService.normalizeActivityType(this.activity);
    this.baseValue = this.validationService.getBaseValue(this.activity ? this.activityType : this.type);
    this.currentValue = Math.floor((this.currentProgress * this.baseValue) / RULES.PROGRESS_PRECISION);
    this.newValue = this.active ? parseInt(this.activity && this.activity[StaticValidationService.baseActivityTypeMap.get(this.activityType) || ''] || 0,  10) : 0;
    this.totalValue = this.active ? this.newValue + this.currentValue : this.currentValue;
    this.progress = this.activity ? this.validationService.getBaseCardProgress(this.activity) : 0;
    this.totalProgress = this.active ? this.currentProgress + this.progress : 0;

    this.complete = !(this.active && this.activity) && this.currentProgress > RULES.PROGRESS_PRECISION;

    this.reward = this.reward * Math.floor(this.totalProgress / RULES.PROGRESS_PRECISION);

    this.radius = this.small ? 25 : 35;
    this.strokeWidth = this.small ? 7 : 11;
    if(this.monochrome) {
        this.strokeColor = '#fff';
    } else {
      switch (this.type) {
        case 'run':
          this.strokeColor = '#494ADB';
          break;
        case 'walk':
          this.strokeColor = '#7fa829';
          break;
        case 'ride':
          this.strokeColor = '#fbb02e';
          break;
        case 'other':
          this.strokeColor = '#f06449';
          break;
        default:
          this.strokeColor = '#fff';

      }
    }
  }

}
