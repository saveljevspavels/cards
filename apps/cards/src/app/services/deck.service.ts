import { Injectable } from '@angular/core';
import {BehaviorSubject, combineLatest} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {LocalStorageService} from "./local-storage.service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import Hand from "../interfaces/hand";
import {ConstService} from "./const.service";
import Card, {NullCard} from "../../../../shared/interfaces/card";
import {UtilService} from "./util.service";
import {AuthService} from "./auth.service";
import {CardScheme} from "../../../../shared/interfaces/card-scheme.interface";

@Injectable({
  providedIn: 'root'
})
export class DeckService {

    public cards = new BehaviorSubject<Card[]>([]);
    public queueIds = new BehaviorSubject<string[]>([]);
    public cardQueue = new BehaviorSubject<Card[]>([]);
    public cardScheme = new BehaviorSubject<CardScheme>({boards: []});
    private cardCollection = this.db.collection(ConstService.CONST.COLLECTIONS.CARDS);
    private cardQueueDocument = this.db.collection(ConstService.CONST.COLLECTIONS.HANDS).doc(ConstService.CONST.HANDS.QUEUE);
    private cardSchemeDocument = this.db.collection(ConstService.CONST.COLLECTIONS.SCHEME).doc(ConstService.CONST.SCHEME_ID);

    constructor(
        private db: AngularFirestore,
        private http: HttpClient,
        private authService: AuthService
        ) {
        this.cardCollection.valueChanges().subscribe((cards: any[]) => {
            this.cards.next(cards)
        });
        this.cardQueueDocument.valueChanges().subscribe((queue: any) => {
            this.queueIds.next(queue.cardIds)
        });
        this.cardSchemeDocument.valueChanges().subscribe((cardScheme: any) => {
            this.cardScheme.next(cardScheme)
        });
        combineLatest([
            this.queueIds,
            this.cards
        ]).subscribe(([queue, cards]) => {
            if(cards.length) {
                this.cardQueue.next(UtilService.sortByProp(cards.filter((card: Card) => queue.indexOf(card.id) !== -1)))
            }
        })
    }

    getCard(cardId: string): Card {
        return this.cards.value.find((card: Card) => card.id === cardId) || NullCard
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
