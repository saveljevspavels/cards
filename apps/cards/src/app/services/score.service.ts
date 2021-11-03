import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {CONST} from "../app.module";

@Injectable()
export class ScoreService {

  public scores = new BehaviorSubject<any>([]);
  private scoreCollection = this.db.collection(CONST.COLLECTIONS.SCORES);

  constructor(private db: AngularFirestore) {
    this.scoreCollection.valueChanges().subscribe((scores: any[]) => {
      this.scores.next(scores)
    });
  }
}
