import { Component, OnInit } from '@angular/core';
import {ConstService} from "../../../../services/const.service";
import {ScoreService} from "../../../../services/score.service";
import {AuthService} from "../../../../services/auth.service";
import Score from "../../../../../../../shared/interfaces/score.interface";

@Component({
  selector: 'app-points-display',
  templateUrl: './points-display.component.html',
  styleUrls: ['./points-display.component.scss']
})
export class PointsDisplayComponent implements OnInit {

  public RULES = ConstService.RULES;
  public myScore$ = this.scoreService.myScore;

  public position: string;

  constructor(
      private scoreService: ScoreService,
      private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.scoreService.scores.subscribe((scores) => {
      this.position = this.numberToPosition(scores.findIndex((score: Score) => score.athleteId === this.authService.myId.value) + 1);
    })
  }

  numberToPosition(number: number): string {
    const suffixes = ['st', 'nd', 'rd'];
    const exceptions = [11, 12, 13];
    const mod = number % 10;

    if (exceptions.includes(number)) {
      return number + 'th';
    } else if (mod <= 3) {
      return number + suffixes[mod - 1];
    } else {
      return number + 'th';
    }
  }

}
