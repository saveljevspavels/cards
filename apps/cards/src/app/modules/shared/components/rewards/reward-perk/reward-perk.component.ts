import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-reward-perk',
  templateUrl: './reward-perk.component.html',
  styleUrls: ['./reward-perk.component.scss']
})
export class RewardPerkComponent implements OnInit {

  @Input() value: number;

  constructor() { }

  ngOnInit(): void {
  }

}
