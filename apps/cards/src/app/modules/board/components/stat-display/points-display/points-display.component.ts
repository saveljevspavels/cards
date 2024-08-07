import { Component, OnInit } from '@angular/core';
import {ConstService} from "../../../../../services/const.service";
import {ScoreService} from "../../../../../services/score.service";
import Score from "../../../../../../../../shared/interfaces/score.interface";
import {AthleteService} from "../../../../../services/athlete.service";
import {combineLatest} from "rxjs";
import {PERMISSIONS} from "../../../../../constants/permissions";
import {Router} from "@angular/router";

@Component({
  selector: 'app-points-display',
  templateUrl: './points-display.component.html',
  styleUrls: ['./points-display.component.scss']
})
export class PointsDisplayComponent implements OnInit {

  public RULES = ConstService.RULES;
  public athlete$ = this.athleteService.me;
  public PERMISSIONS = PERMISSIONS;
  public myScore$ = this.scoreService.myScore;
  public hasPermission$ = this.athleteService.hasPermission$;
  public position: string;

  constructor(
      private scoreService: ScoreService,
      private athleteService: AthleteService,
      private router: Router
  ) { }

  ngOnInit(): void {
    combineLatest([
      this.scoreService.scores,
      this.athleteService.myId
    ]).subscribe(([scores, myId]) => {
      this.position = this.numberToPosition(scores
          .findIndex((score: Score) => score.athleteId === myId) + 1);
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

  goToLeaderboard() {
    this.router.navigateByUrl('board/leaderboard');
  }
}
