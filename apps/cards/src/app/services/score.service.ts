import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {ConstService} from "./const.service";

@Injectable()
export class ScoreService {

  public scores = new BehaviorSubject<any>([]);
  private scoreCollection = this.db.collection(ConstService.CONST.COLLECTIONS.SCORES);

  constructor(private db: AngularFirestore) {
    this.scoreCollection.valueChanges().subscribe((scores: any[]) => {
      this.scores.next(scores)
    });
  }
}
