import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";
import {LocalStorageService} from "../../../../services/local-storage.service";
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {DeckService} from "../../../../services/deck.service";
import {BehaviorSubject, combineLatest} from "rxjs";
import {CONST, RULES} from "../../../../app.module";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => HandComponent),
    multi: true,
  }]
})
export class HandComponent implements OnInit, ControlValueAccessor {

    public rules = RULES;
    public possibleCombinations = new BehaviorSubject<any[]>([])
    public cards = new BehaviorSubject<any[]>([]);
    public selectedCards = new FormControl([]);

    constructor(private db: AngularFirestore,
    private deckService: DeckService) {
        combineLatest([
            db.collection(CONST.COLLECTIONS.HANDS).doc(LocalStorageService.athleteId).valueChanges(),
            this.deckService.cards.asObservable()]
        )
        .pipe(map(([athleteCards, allCards]: any) => {
            return allCards.filter((card: any) =>
                (athleteCards?.cardIds || []).indexOf(card.id) !== -1 )
            }
        ))
        .subscribe((cards: any) => {
            this.cards.next(cards)
            this.possibleCombinations.next(this.findPossibleCombinations(this.cards.value))
        });


        this.selectedCards.valueChanges.subscribe((values) => {
            this._onChange(values)
        })
    }

    ngOnInit(): void {
    }

    discardCards() {
        this.deckService.discardCards(this.selectedCards.value).subscribe(() => {
            this.selectedCards.setValue([])
        })
    }

    findPossibleCombinations(cards: any[]): any[] {
        if(cards.length < 2) {
          return []
        }
        const combinations: any[] = [];
        cards.forEach((card: any) => {
            const sameCard = cards.find(innerCard => {
                return card.factoryId === innerCard.factoryId && card.tier === innerCard.tier && card.id !== innerCard.id;
            })
            if(sameCard) {
                const newPair = [card.id, sameCard.id];
                if(!combinations.find((pair) => { // Check if similar pair already exists
                    return (pair[0] === newPair[0] && pair[1] === newPair[1]) || (pair[0] === newPair[1] && pair[1] === newPair[0])
                })) {
                    combinations.push(newPair)
                }
            }
        })
        return combinations;
    }

    drawCard() {
        this.deckService.drawCard().subscribe()
    }

    combineCards() {
        this.deckService.combineCards(this.possibleCombinations.value[0]).subscribe()
    }

    _onChange: any = () => {};
    _onTouched: any = () => {};

    writeValue(value: any) {
        this.selectedCards.setValue(value)
    }

    registerOnChange(fn: any) {
        this._onChange = fn;
    }

    registerOnTouched(fn: any) {
        this._onTouched = fn;
    }
}
