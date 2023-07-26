import {Component, Input, OnInit} from '@angular/core';
import Card from "../../../../../../../shared/interfaces/card.interface";

@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.scss']
})
export class RewardsComponent implements OnInit {

  @Input() card: Card;
  @Input() rewardsOnly = false;

  constructor() { }

  ngOnInit(): void {
  }

}
