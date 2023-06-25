import { Component, OnInit } from '@angular/core';
import {ConstService} from "../../../../services/const.service";
import {ScoreService} from "../../../../services/score.service";

@Component({
  selector: 'app-points-display',
  templateUrl: './points-display.component.html',
  styleUrls: ['./points-display.component.scss']
})
export class PointsDisplayComponent implements OnInit {

  public RULES = ConstService.RULES;
  public myScore$ = this.scoreService.myScore;

  constructor(public scoreService: ScoreService) { }

  ngOnInit(): void {

  }

}
