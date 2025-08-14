import {Component, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation} from '@angular/core';
import {ValidationService} from "../../../../services/validation.service";
import {StaticValidationService} from "../../../../../../../shared/services/validation.service";
import {RULES} from "../../../../../../../../definitions/rules";
import {ChallengeStatType} from "../../../../../../../shared/interfaces/progressive-challenge.interface";

@Component({
  selector: 'app-circular-progress-bar',
  templateUrl: './circular-progress-bar.component.html',
  styleUrls: ['./circular-progress-bar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CircularProgressBarComponent implements OnChanges {

  @Input() type: string;
  @Input() color: string;
  @Input() icon: string;
  @Input() activity: any;
  @Input() animated = false;
  @Input() currentProgress: number;
  @Input() currentValue: number;
  @Input() monochrome = false;
  @Input() small = false;
  @Input() showDescription = true;
  @Input() reward = 0;
  @Input() targetValue = 0;
  @Input() challengeStat: ChallengeStatType;

  public active: boolean = true;
  public progress: number;
  public totalProgress: number;
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

  ngOnChanges(changes: SimpleChanges): void {
    this.activityType = StaticValidationService.normalizeActivityType(this.activity);
    this.baseValue = this.targetValue || this.validationService.getBaseValue(this.activity ? this.activityType : this.type);
    if(!isNaN(changes.currentProgress?.currentValue)) {
      this.currentValue = Math.floor((this.currentProgress * this.baseValue) / RULES.PROGRESS_PRECISION);
    } else if (!isNaN(changes.currentValue?.currentValue)) {
      this.currentProgress = Math.floor((this.currentValue * RULES.PROGRESS_PRECISION) / this.baseValue);
    }
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
      const param = this.color || this.type;
      switch (param) {
        case 'secondary-4':
          this.strokeColor = '#894CD8';
          break;
        case 'light-blue':
          this.strokeColor = '#AEEBFF';
          break;
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
          this.strokeColor = '#494ADB';

      }
    }
  }

  protected readonly ChallengeStatType = ChallengeStatType;
  protected readonly RULES = RULES;
}
