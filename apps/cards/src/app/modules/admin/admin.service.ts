import { Injectable } from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";
import {BehaviorSubject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {COMMANDS} from "../../constants/commands";
import {CONST} from "../../app.module";
import {environment} from "../../../environments/environment";

@Injectable()
export class AdminService {

    public submittedActivities = new BehaviorSubject<any>([])
    public cardFactories = new BehaviorSubject<any>([])

    public deck = new BehaviorSubject<string[]>([]);
    private deckDocument = this.db.collection(CONST.COLLECTIONS.HANDS)

    constructor(private http: HttpClient,
                private db: AngularFirestore,) {
        db.collection(CONST.COLLECTIONS.DETAILED_ACTIVITIES,
            (ref: any) => (
                ref.where('gameData.status', '==', 'submitted')
            )
        ).valueChanges().subscribe((activities: any) => {
            this.submittedActivities.next(activities)
        });

        this.deckDocument.doc(CONST.HANDS.DECK).valueChanges().subscribe((deck: any) => {
            this.deck.next(deck?.cardIds || [])
        });

        db.collection(CONST.COLLECTIONS.CARD_FACTORIES).valueChanges().subscribe((cardFactories: any) => {
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

    public setDeck(cardIds: string[]) {
        return this.http.post(`${environment.baseBE}/set-deck`, cardIds).subscribe()
    }

    public addToDeck(cardIds: string[]) {
        return this.http.post(`${environment.baseBE}/add-to-deck`, cardIds).subscribe()
    }

    public shuffleDeck(cardIds: string[]) {
        return this.http.post(`${environment.baseBE}/shuffle-deck`, {}).subscribe()
    }

    public dealCards(athletes: string[], amount: number) {
        return this.http.post(`${environment.baseBE}/deal-cards`, {
            athletes, amount
        }).subscribe()
    }

    public dealQueue() {
        return this.http.post(`${environment.baseBE}/deal-queue`, {}).subscribe()
    }

    public rejectActivity(activityId: any) {
        return this.http.post(`${environment.baseBE}/reject-activity`, {
            activityId
        })
    }

    public approveActivity(activityId: any, cardIds: string[]) {
        return this.http.post(`${environment.baseBE}/approve-activity`, {
            activityId,
            cardIds
        })
    }

    public createCardFactory(card: any) {
        return this.http.post(`${environment.baseBE}/create-card-factory`, {
            ...card
        })
    }

    public createCardInstances(body: any) {
        return this.http.post(`${environment.baseBE}/create-card-instances`, body)
    }
}
