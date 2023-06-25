import { Injectable } from '@angular/core';
import {BehaviorSubject, combineLatest, forkJoin} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {ConstService} from "./const.service";
import Athlete from "../../../../shared/interfaces/athlete.interface";
import {AuthService} from "./auth.service";
import Score from "../../../../shared/interfaces/score.interface";

@Injectable()
export class ScoreService {

  public scores = new BehaviorSubject<any>([]);
  public myScore = new BehaviorSubject<Score | null>(null);
  private scoreCollection = this.db.collection(ConstService.CONST.COLLECTIONS.SCORES);

  constructor(private db: AngularFirestore,
              private authService: AuthService) {
    this.scoreCollection.valueChanges().subscribe((scores: any[]) => {
      this.scores.next(scores);
    });
    combineLatest([
      this.authService.myId,
      this.scoreCollection.valueChanges()
    ]).subscribe(([myId, scores]: any) => {
      if(!myId || !scores.length) {
        return;
      }
      this.scores.next(scores);
      this.myScore.next(scores.find((score: Score) => score.athleteId === myId) || null)
    });
  }
}
