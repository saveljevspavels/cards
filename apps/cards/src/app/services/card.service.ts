import { Injectable } from '@angular/core';
import {BehaviorSubject, combineLatest} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {LocalStorageService} from "./local-storage.service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import Hand from "../interfaces/hand";
import {ConstService} from "./const.service";
import CardInterface, {NullCard} from "../../../../shared/interfaces/card";
import {UtilService} from "./util.service";
import {AuthService} from "./auth.service";
import {CardScheme} from "../../../../shared/interfaces/card-scheme.interface";

@Injectable({
  providedIn: 'root'
})
export class CardService {

    public cards = new BehaviorSubject<CardInterface[]>([]);
    public cardScheme = new BehaviorSubject<CardScheme>({boards: []});
    private cardCollection = this.db.collection(ConstService.CONST.COLLECTIONS.CARDS);
    private cardSchemeDocument = this.db.collection(ConstService.CONST.COLLECTIONS.SCHEME).doc(ConstService.CONST.SCHEME_ID);

    constructor(
        private db: AngularFirestore,
        ) {
        this.cardCollection.valueChanges().subscribe((cards: any[]) => {
            this.cards.next(cards)
        });
        this.cardSchemeDocument.valueChanges().subscribe((cardScheme: any) => {
            this.cardScheme.next(cardScheme)
        });
    }

    getCard(cardId: string): CardInterface {
        return this.cards.value.find((card: CardInterface) => card.id === cardId) || NullCard
    }
}
