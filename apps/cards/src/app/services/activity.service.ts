import { Injectable } from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";
import {BehaviorSubject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {debounceTime} from "rxjs/operators";
import {LocalStorageService} from "./local-storage.service";
import {CONST} from "../app.module";
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ActivityService {

  public pendingActivities = new BehaviorSubject<any>([])
  public approvedActivities = new BehaviorSubject<any>([])
  public newActivities = new BehaviorSubject<any>([])

  constructor(private db: AngularFirestore,
              private http: HttpClient) {
    db.collection(CONST.COLLECTIONS.PENDING_ACTIVITIES,
        (ref: any) => ref.where('owner_id', '==', LocalStorageService.athleteId))
      .valueChanges().subscribe((activities: any) => {
      this.pendingActivities.next(activities)
    });

    db.collection(CONST.COLLECTIONS.DETAILED_ACTIVITIES,
        (ref: any) => ref.where('gameData.status', '==', CONST.ACTIVITY_STATUSES.APPROVED)
    ).valueChanges().subscribe((activities: any) => {
      this.approvedActivities.next(activities)
    });

    db.collection(CONST.COLLECTIONS.DETAILED_ACTIVITIES,
        (ref: any) => (
        ref
            .where('athlete.id', '==', LocalStorageService.athlete.id)
            .where('gameData.status', 'in', [CONST.ACTIVITY_STATUSES.NEW, CONST.ACTIVITY_STATUSES.SUBMITTED])
      )
    ).valueChanges().subscribe((activities: any) => {
      this.newActivities.next(activities)
    });

    this.pendingActivities.asObservable().pipe(debounceTime(3000)).subscribe((activities: any) => {
      if(activities.length) {
          this.requestActivities({
            activityIds: activities.map((activity: any) => activity.object_id)
          }).subscribe()
      }
    });
  }

  requestActivities(body: any) {
    return this.http.post(`${environment.baseBE}/activities`, {
      ...body,
      accessToken: LocalStorageService.accessToken
    })
  }

  submitActivity(activityId: string, cards: string[], images: string[], comments: string) {
    return this.http.post(`${environment.baseBE}/submit-activity`, {
      activityId,
      cards,
      images,
      comments
    })
  }

  public rejectActivity(activityId: any, reason: string) {
    return this.http.post(`${environment.baseBE}/reject-activity`, {
        activityId,
        comments: reason
    })
  }
}
