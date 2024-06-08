import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-reward-energy',
  templateUrl: './reward-energy.component.html',
  styleUrls: ['./reward-energy.component.scss']
})
export class RewardEnergyComponent implements OnInit {

  @Input() value: number
  @Input() big = false;

  constructor() { }

  ngOnInit(): void {
  }

}
