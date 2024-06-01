import {Component, Input, OnChanges} from '@angular/core';
import Card from "../../../../../../../shared/interfaces/card.interface";
import {AbilityKey} from "../../../../../../../shared/interfaces/ability.interface";

@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.scss']
})
export class RewardsComponent implements OnChanges {

  @Input() card: Card;
  @Input() perks: {[key: string]: number} = {};
  @Input() rewardsOnly = false;

  public experienceReward: number = 0;

  constructor() { }

  ngOnChanges() {
    if(this.card || this.perks) {
      this.experienceReward = parseInt(this.card?.experienceReward?.toString() || '0') + (this.perks[AbilityKey.EXPERIENCE_PER_TASK_BONUS.toString()] || 0);
    }
  }

}
