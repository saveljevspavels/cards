import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {COMMANDS} from "../../constants/commands";
import {environment} from "../../../environments/environment";
import {ConstService} from "../../services/const.service";
import CardFactory from "../../../../../shared/interfaces/card-factory.interface";
import {CardScheme} from "../../../../../shared/interfaces/card-scheme.interface";
import {map} from "rxjs/operators";
import {CardSnapshot} from "../../../../../shared/classes/card.class";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Activity} from "../../../../../shared/interfaces/activity.interface";

@Injectable()
export class AdminService {

    public reportedActivities = new BehaviorSubject<Activity[]>([])
    public cardFactories = new BehaviorSubject<any>([])

    constructor(private http: HttpClient,
                private db: AngularFirestore,) {
        db.collection(ConstService.CONST.COLLECTIONS.DETAILED_ACTIVITIES,
            (ref: any) => (
                ref.where('gameData.cardSnapshots', '!=', [])
            )
        ).valueChanges()
            .pipe(
                map((activities: any[]) => {
                    return activities.map(activity => {
                        activity.gameData.cardSnapshots = activity.gameData.cardSnapshots.map((card: any) => {
                            return CardSnapshot.fromJSONObject(card)
                        })
                        return activity

                    })
                }),
                map((activities: Activity[]) => activities.filter(activity =>
                    activity.gameData.cardSnapshots.find((card: CardSnapshot) =>
                        (card.reports?.length ? card.reports : [])?.find(report => !report.resolved)
                    )
                )
            )
            )
            .subscribe((activities: any) => {
            this.reportedActivities.next(activities)
        });

        db.collection(ConstService.CONST.COLLECTIONS.CARD_FACTORIES).valueChanges().subscribe((cardFactories: any) => {
        this.cardFactories.next(cardFactories)
    });
    }

    private postCommands(athleteIds: string[], command: any) {
        return this.http.post(`${environment.baseBE}/admin/commands`, {
            athleteIds,
            command
        })
    }

    public requestActivities(athleteIds: string[]) {
        return this.postCommands(athleteIds, {
            type: COMMANDS.REQUEST_ACTIVITIES,
        }).subscribe()
    }

    public calculateBaseWorkout(athleteIds: string[]) {
        return this.postCommands(athleteIds, {
            type: COMMANDS.CALCULATE_BASE_WORKOUT,
        }).subscribe()
    }

    public deleteCards(cardIds: string[]) {
        return this.http.post(`${environment.baseBE}/cards/delete`, {cardIds}).subscribe()
    }

    public approveActivity(activityId: any, cardIds: string[]) {
        return this.http.post(`${environment.baseBE}/approve-activity`, {
            activityId,
            cardIds
        })
    }

    public createCardFactory(cardFactory: CardFactory) {
        return this.http.post(`${environment.baseBE}/create-card-factory`, {
            ...cardFactory
        })
    }

    public createCardInstances(body: any) {
        return this.http.post(`${environment.baseBE}/create-card-instances`, body)
    }

    public startGame(startDate: string) {
        return this.http.post(`${environment.baseBE}/start-game`, {startDate})
    }

    public getLogs(): Observable<Object> {
        return this.http.get(`${environment.baseBE}/admin/logs`)
    }

    public saveSchema(scheme: CardScheme) {
        return this.http.post(`${environment.baseBE}/admin/save-schema`, scheme)
    }
}
