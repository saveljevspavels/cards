import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-reward-random-perk',
  templateUrl: './reward-random-perk.component.html',
  styleUrls: ['./reward-random-perk.component.scss']
})
export class RewardRandomPerkComponent implements OnInit {

  @Input() value: number;

  constructor() { }

  ngOnInit(): void {
  }

}
