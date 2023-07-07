import { Injectable } from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";
import {BehaviorSubject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {debounceTime, distinctUntilChanged, filter} from "rxjs/operators";
import {environment} from "../../environments/environment";
import {AthleteService} from "./athlete.service";
import {ConstService} from "./const.service";
import Athlete from "../../../../shared/interfaces/athlete.interface";

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
                        .where('gameData.status', '==', ConstService.CONST.ACTIVITY_STATUSES.NEW)
                )
            ).valueChanges().subscribe((activities: any) => {
                this.newActivities.next(activities)
            });
        })

        db.collection(
            ConstService.CONST.COLLECTIONS.DETAILED_ACTIVITIES,
            (ref: any) => ref.where('gameData.status', '==', ConstService.CONST.ACTIVITY_STATUSES.APPROVED)
        ).valueChanges().subscribe((activities: any) => {
            console.log('approved', activities)
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
        return this.http.post(`${environment.baseBE}/calculate-base-workout`, {
            ...body
        })
    }

    submitActivity(activityId: string, cardIds: string[], images: string[][], comments: string[]) {
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

    public deleteActivity(activityId: any) {
        return this.http.post(`${environment.baseBE}/delete-activity`, {
            activityId
        })
    }
}
