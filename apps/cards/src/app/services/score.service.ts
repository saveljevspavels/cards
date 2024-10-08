import { Injectable } from '@angular/core';
import {BehaviorSubject, combineLatest, forkJoin} from "rxjs";
import {ConstService} from "./const.service";
import Score from "../../../../shared/interfaces/score.interface";
import {AthleteService} from "./athlete.service";
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/compat/firestore";
import Athlete from "../../../../shared/classes/athlete.class";

@Injectable({
    providedIn: 'root'
})
export class ScoreService {

  public scores = new BehaviorSubject<any>([]);
  public myScore = new BehaviorSubject<Score | null>(null);
  private scoreCollection: AngularFirestoreCollection<Score>;

  constructor(private db: AngularFirestore,
              private athleteService: AthleteService) {
    this.scoreCollection = this.db.collection(ConstService.CONST.COLLECTIONS.SCORES);
    this.scoreCollection.valueChanges().subscribe((scores: any[]) => {
      this.scores.next(this.sortScores(scores));
    });
    combineLatest([
      this.athleteService.myId,
      this.scoreCollection.valueChanges(),
      this.athleteService.athletes.asObservable()
    ]).subscribe(([myId, scores, athletes]: any) => {
      if(!myId || !scores.length || !athletes.length) {
        return;
      }

      scores = scores.map((score: Score) => {
          score.level = athletes.find((athlete: Athlete) => athlete.id.toString() === score.athleteId).level;
          return score;
      });

      this.scores.next(this.sortScores(scores as Score[]));
      this.myScore.next(scores.find((score: Score) => score.athleteId === myId) || null)
    });
  }

  sortScores(scores: Score[]): Score[] {
    return scores.sort((a: Score, b: Score) =>
        b.value - a.value || ((a.level && b.level) ? (b.level - a.level) : 0)
    )
  }
}
