import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {ConstService} from "./const.service";
import {Card} from "../../../../shared/classes/card.class";
import {CardScheme} from "../../../../shared/interfaces/card-scheme.interface";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from "@angular/fire/compat/firestore";
import {FormControl} from "@angular/forms";
import {ValidationStatus} from "../../../../shared/services/validation.service";
import {Activity} from "../../../../shared/interfaces/activity.interface";
import {ValidationService} from "./validation.service";

@Injectable({
  providedIn: 'root'
})
export class CardService {

    public cards = new BehaviorSubject<Card[]>([]);
    public cardScheme = new BehaviorSubject<CardScheme>({boards: []});
    private cardCollection: AngularFirestoreCollection;
    private cardSchemeDocument: AngularFirestoreDocument<CardScheme>;

    public selectedCards: FormControl = new FormControl<ValidatedCard[]>([]);

    constructor(
        private http: HttpClient,
        private db: AngularFirestore,
        private validationService: ValidationService
        ) {
        this.cardCollection = this.db.collection(ConstService.CONST.COLLECTIONS.CARDS);
        this.cardSchemeDocument = this.db.collection(ConstService.CONST.COLLECTIONS.SCHEME).doc(ConstService.CONST.SCHEME_ID);
        this.cardCollection.valueChanges().subscribe((cards: any[]) => {
            this.cards.next(cards)
        });
        this.cardSchemeDocument.valueChanges().subscribe((cardScheme: any) => {
            this.cardScheme.next(cardScheme)
        });
    }

    getCard(cardId: string): Card {
        return this.cards.value.find((card: Card) => card.id === cardId) || Card.empty()
    }

    activateCard(cardId: string) {
        return this.http.post(`${environment.baseBE}/cards/activate-card`, {
            cardId
        })
    }

    claimCardReward(cardId: string) {
        return this.http.post(`${environment.baseBE}/cards/claim-reward`, {
            cardId
        })
    }

    unlockLevel(boardKey: string) {
        return this.http.post(`${environment.baseBE}/cards/unlock-level`, {
            boardKey,
        })
    }

    reportCard(cardId: string, activityId: string, comment: string) {
        return this.http.post(`${environment.baseBE}/cards/report`, {
            cardId,
            activityId,
            comment
        })
    }

    rejectCard(cardId: string, activityId: string, comment: string) {
        return this.http.post(`${environment.baseBE}/cards/reject`, {
            cardId,
            activityId,
            comment
        })
    }

    resolveReport(cardId: string, activityId: string, reportId: string) {
        return this.http.post(`${environment.baseBE}/cards/resolve-report`, {
            cardId,
            activityId,
            reportId
        })
    }

    likeCard(cardId: string, activityId: string) {
        return this.http.post(`${environment.baseBE}/cards/like`, {
            cardId,
            activityId
        })
    }

    validateCard(activity: Activity | null, card: Card, selectedCards: ValidatedCard[] | null) {
        if(!activity) {
            return ValidationStatus.NONE;
        }

        if(selectedCards !== null && selectedCards.find(validatedCard => validatedCard.card === card)) {
            return ValidationStatus.SELECTED
        }

        return this.validationService.validateCardGroup(
            activity,
            [
                ...this.getPlainCards(this.selectedCards.value),
                card
            ])
            ? ValidationStatus.PASS
            : ValidationStatus.FAIL;

    }

    getPlainCards(validatedCards: ValidatedCard[]): Card[] {
        return validatedCards.map((validatedCard: ValidatedCard) => validatedCard.card);
    }
}

export interface ValidatedCard {
    card: Card,
    validationStatus: ValidationStatus
}
