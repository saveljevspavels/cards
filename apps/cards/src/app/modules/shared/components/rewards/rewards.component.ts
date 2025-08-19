import {Component, Input, OnChanges, ViewEncapsulation} from '@angular/core';
import {AbilityKey} from "../../../../../../../shared/interfaces/ability.interface";
import {Currencies} from "../../../../../../../shared/classes/currencies.class";
import { RULES } from '../../../../../../../../definitions/rules';

@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RewardsComponent implements OnChanges {

  @Input() rewards: Currencies;
  @Input() energyCost: number = 0;
  @Input() perks: {[key: string]: number} = {};
  @Input() rewardsOnly = false;
  @Input() vertical = false;

  public experienceReward: number = 0;

  constructor() { }

  ngOnChanges() {
    if(this.rewards || this.perks) {
      this.experienceReward = parseInt(this.rewards.experience?.toString() || '0') + ((this.perks[AbilityKey.EXPERIENCE_PER_TASK_BONUS.toString()] || 0) * RULES.TASK_EXTRA_EXPERIENCE);
    }
  }

}
