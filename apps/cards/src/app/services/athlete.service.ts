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
export class AthleteService {

  public athletes = new BehaviorSubject<any>([]);
  private athleteCollection = this.db.collection(CONST.COLLECTIONS.ATHLETES);
  private commandCollection = this.db.collection(CONST.COLLECTIONS.COMMANDS,
    (ref) => ref.where('athleteId', '==', LocalStorageService.athlete.id.toString()));

  constructor(private db: AngularFirestore,
              private activityService: ActivityService) {
    this.athleteCollection.valueChanges().subscribe((athletes: any[]) => {
      this.athletes.next(athletes)
    });

    this.commandCollection.valueChanges().subscribe((commands: any[]) => {
      commands.forEach(command => {
        switch(command.type) {
          case COMMANDS.REQUEST_ACTIVITIES:
            this.activityService.requestActivities({
              from: GAME_START,
              commandId: command.id
            }).subscribe()
            break;
        }
      })
    });
  }

  get me() {
    return this.athletes.pipe(map((athletes) => {
      return athletes.find((athlete: any) => athlete.id === LocalStorageService.athlete.id)
    }))
  }

  getAthlete(athleteId: string) {
    return this.athletes.value.find((athlete: any) => athlete.id.toString() === athleteId) || {}
  }
}
