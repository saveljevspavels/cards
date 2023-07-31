import { Injectable } from '@angular/core';
import {BehaviorSubject, combineLatest, forkJoin} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {ConstService} from "./const.service";
import Score from "../../../../shared/interfaces/score.interface";
import {AthleteService} from "./athlete.service";

@Injectable()
export class ScoreService {

  public scores = new BehaviorSubject<any>([]);
  public myScore = new BehaviorSubject<Score | null>(null);
  private scoreCollection = this.db.collection(ConstService.CONST.COLLECTIONS.SCORES);

  constructor(private db: AngularFirestore,
              private athleteService: AthleteService) {
    this.scoreCollection.valueChanges().subscribe((scores: any[]) => {
      this.scores.next(this.sortScores(scores));
    });
    combineLatest([
      this.athleteService.myId,
      this.scoreCollection.valueChanges()
    ]).subscribe(([myId, scores]: any) => {
      if(!myId || !scores.length) {
        return;
      }
      this.scores.next(this.sortScores(scores));
      this.myScore.next(scores.find((score: Score) => score.athleteId === myId) || null)
    });
  }

  sortScores(scores: Score[]): Score[] {
    return scores.sort((a: Score, b: Score) =>
        b.value - a.value || b.cardsPlayed - a.cardsPlayed
    )
  }
}
