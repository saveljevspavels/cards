import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {LocalStorageService} from "./local-storage.service";
import {COMMANDS} from "../constants/commands";
import {ActivityService} from "./activity.service";
import {GAME_START} from "../constants/game";
import {CONST} from "../app.module";
import {filter, map} from "rxjs/operators";

@Injectable()
export class ScoreService {

  public scores = new BehaviorSubject<any>([]);
  private scoreCollection = this.db.collection(CONST.COLLECTIONS.SCORES);

  constructor(private db: AngularFirestore,
              private activityService: ActivityService) {
    this.scoreCollection.valueChanges().subscribe((scores: any[]) => {
      this.scores.next(scores)
    });
  }
}
