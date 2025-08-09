import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {debounceTime, distinctUntilChanged, filter, map, take} from "rxjs/operators";
import {environment} from "../../environments/environment";
import {AthleteService} from "./athlete.service";
import {ConstService} from "./const.service";
import Athlete from "../../../../shared/classes/athlete.class";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {UploadedImage} from "../../../../shared/interfaces/image-upload.interface";
import {ActivityStatus} from "../../../../shared/interfaces/activity.interface";
import {CardSnapshot} from "../../../../shared/classes/card.class";

@Injectable({
    providedIn: 'root'
})
export class ActivityService {

    public pendingActivities = new BehaviorSubject<any>([])
    public approvedActivities = new BehaviorSubject<any>([])
    public newActivities = new BehaviorSubject<any>([])

    constructor(private db: AngularFirestore,
                private http: HttpClient,
                private athleteService: AthleteService) {
        this.athleteService.me.pipe(
            filter((me) => !!me),
            distinctUntilChanged()
        ).subscribe((me: Athlete | null) => {
            db.collection(
                ConstService.CONST.COLLECTIONS.PENDING_ACTIVITIES,
                (ref: any) => ref.where('owner_id', '==', parseInt(me?.id || '', 10))
            ).valueChanges().subscribe((activities: any) => {
                this.pendingActivities.next(activities)
            });

            db.collection(ConstService.CONST.COLLECTIONS.DETAILED_ACTIVITIES,
                (ref: any) => (
                    ref
                        .where('athlete.id', '==', parseInt(me?.id || '', 10))
                        .where('gameData.status', '==', ActivityStatus.NEW)
                )
            ).valueChanges().subscribe((activities: any) => {
                this.newActivities.next(activities)
            });
        })

        db.collection(
            ConstService.CONST.COLLECTIONS.DETAILED_ACTIVITIES,
            (ref: any) => ref.where('gameData.status', '==', ActivityStatus.APPROVED)
        ).valueChanges().pipe(
            map((activities: any[]) => {
                return activities.map(activity => {
                    activity.gameData.cardSnapshots = activity.gameData.cardSnapshots.map((card: any) => {
                        return CardSnapshot.fromJSONObject(card)
                    })
                    return activity
                })
            })).subscribe((activities: any) => {
            this.approvedActivities.next(activities)
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
            ...body
        })
    }

    calculateBaseWorkout(body: any) {
        return this.http.post(`${environment.baseBE}/athlete/calculate-base-workout`, {
            ...body
        })
    }

    submitActivity(activityId: string, cardIds: string[], images: UploadedImage[][], comments: string[]) {
        return this.http.post(`${environment.baseBE}/submit-activity`, {
            activityId,
            cardIds,
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

    public commentActivity(activityId: string, cardId: string, comment: string): Observable<any> {
        return this.http.post(`${environment.baseBE}/activity/comment`, {
            activityId,
            comment,
            cardId
        })
    }

    public deleteActivityComment(activityId: string, cardId: string, commentId: string): Observable<any> {
        return this.http.post(`${environment.baseBE}/activity/comment/delete`, {
            activityId,
            commentId,
            cardId
        })
    }

    public boostActivity(activityId: any): Observable<any> {
        return this.http.post(`${environment.baseBE}/activity/boost`, {
            activityId,
        })
    }
    public deleteActivity(activityId: any) {
        return this.http.post(`${environment.baseBE}/delete-activity`, {
            activityId
        })
    }
}
