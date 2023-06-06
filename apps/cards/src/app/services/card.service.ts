import { Injectable } from '@angular/core';
import {BehaviorSubject, combineLatest} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {ConstService} from "./const.service";
import Card, {NullCard} from "../../../../shared/interfaces/card.interface";
import {CardScheme} from "../../../../shared/interfaces/card-scheme.interface";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class CardService {

    public cards = new BehaviorSubject<Card[]>([]);
    public cardScheme = new BehaviorSubject<CardScheme>({boards: []});
    private cardCollection = this.db.collection(ConstService.CONST.COLLECTIONS.CARDS);
    private cardSchemeDocument = this.db.collection(ConstService.CONST.COLLECTIONS.SCHEME).doc(ConstService.CONST.SCHEME_ID);

    constructor(
        private http: HttpClient,
        private db: AngularFirestore,
        ) {
        this.cardCollection.valueChanges().subscribe((cards: any[]) => {
            this.cards.next(cards)
        });
        this.cardSchemeDocument.valueChanges().subscribe((cardScheme: any) => {
            this.cardScheme.next(cardScheme)
        });
    }

    getCard(cardId: string): Card {
        return this.cards.value.find((card: Card) => card.id === cardId) || NullCard
    }

    activateCard(cardId: string) {
        return this.http.post(`${environment.baseBE}/cards/activate-card`, {
            cardId
        })
    }
}
