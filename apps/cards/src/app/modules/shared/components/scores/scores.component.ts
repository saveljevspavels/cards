import { Component, OnInit } from '@angular/core';
import {ScoreService} from "../../../../services/score.service";

@Component({
  selector: 'app-scores',
  templateUrl: './scores.component.html',
  styleUrls: ['./scores.component.scss']
})
export class ScoresComponent implements OnInit {

  public scores = this.scoreService.scores;

  constructor(private scoreService: ScoreService) { }

  ngOnInit(): void {
  }

}
