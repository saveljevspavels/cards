import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {LocalStorageService} from "./local-storage.service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import Hand from "../interfaces/hand";
import {ConstService} from "./const.service";

@Injectable({
  providedIn: 'root'
})
export class DeckService {

    public cards = new BehaviorSubject<any>([]);
    public cardQueue = new BehaviorSubject<Hand>({cardIds: []});
    public card = new BehaviorSubject<Hand>({cardIds: []});
    private cardCollection = this.db.collection(ConstService.CONST.COLLECTIONS.CARDS);
    private cardQueueDocument = this.db.collection(ConstService.CONST.COLLECTIONS.HANDS).doc(ConstService.CONST.HANDS.QUEUE);

    constructor(private db: AngularFirestore,
                private http: HttpClient) {
        this.cardCollection.valueChanges().subscribe((cards: any[]) => {
            this.cards.next(cards)
        });
        this.cardQueueDocument.valueChanges().subscribe((cards: any) => {
            this.cardQueue.next(cards)
        });
    }

    getCard(cardId: string) {
        return this.cards.value.find((card: any) => card.id === cardId) || {}
    }

    discardCards(cardIds: string[]) {
        return this.http.post(`${environment.baseBE}/discard-cards`, {
            cardIds,
            athleteId: LocalStorageService.athleteId
        })
    }

    drawCard() {
        return this.http.post(`${environment.baseBE}/draw-card`, {
            athleteId: LocalStorageService.athleteId
        })
    }

    combineCards(cardIds: string[]) {
        return this.http.post(`${environment.baseBE}/combine-cards`, {
            athleteId: LocalStorageService.athleteId,
            cardIds
        })
    }
}
