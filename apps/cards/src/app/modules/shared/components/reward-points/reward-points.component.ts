import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-reward-points',
  templateUrl: './reward-points.component.html',
  styleUrls: ['./reward-points.component.scss']
})
export class RewardPointsComponent implements OnInit {

  @Input() value: number;
  @Input() big = false;

  constructor() { }

  ngOnInit(): void {
  }

}
