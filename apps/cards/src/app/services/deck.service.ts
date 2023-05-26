import { Injectable } from '@angular/core';
import {BehaviorSubject, combineLatest} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {LocalStorageService} from "./local-storage.service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import Hand from "../interfaces/hand";
import {ConstService} from "./const.service";
import Card from "../../../../shared/interfaces/card";
import {UtilService} from "./util.service";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class DeckService {

    public cards = new BehaviorSubject<any>([]);
    public cardQueue = new BehaviorSubject<Card[]>([]);
    public card = new BehaviorSubject<Hand>({cardIds: []});
    private cardCollection = this.db.collection(ConstService.CONST.COLLECTIONS.CARDS);
    private cardQueueDocument = this.db.collection(ConstService.CONST.COLLECTIONS.HANDS).doc(ConstService.CONST.HANDS.QUEUE);

    constructor(
        private db: AngularFirestore,
        private http: HttpClient,
        private authService: AuthService
        ) {
        this.cardCollection.valueChanges().subscribe((cards: any[]) => {
            this.cards.next(cards)
        });
        combineLatest([
            this.cardQueueDocument.valueChanges(),
            this.cards
        ]).subscribe(([queue, cards]: any) => {
            if(cards.length) {
                this.cardQueue.next(UtilService.sortByProp(cards.filter((card: Card) => queue.cardIds.indexOf(card.id) !== -1)))
            }
        })
    }

    getCard(cardId: string) {
        return this.cards.value.find((card: any) => card.id === cardId) || {}
    }

    discardCards(cardIds: string[]) {
        return this.http.post(`${environment.baseBE}/discard-cards`, {
            cardIds,
            athleteId: this.authService.myId.value
        })
    }

    drawCard() {
        return this.http.post(`${environment.baseBE}/draw-card`, {
            athleteId: this.authService.myId.value
        })
    }

    combineCards(cardIds: string[]) {
        return this.http.post(`${environment.baseBE}/combine-cards`, {
            athleteId: this.authService.myId.value,
            cardIds
        })
    }
}
