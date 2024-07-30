import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-reward-money',
  templateUrl: './reward-money.component.html',
  styleUrls: ['./reward-money.component.scss']
})
export class RewardMoneyComponent implements OnInit {

  @Input() value: number;

  constructor() { }

  ngOnInit(): void {
  }

}
