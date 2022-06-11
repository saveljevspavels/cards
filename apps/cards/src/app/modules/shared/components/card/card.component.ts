import {Component, Input, OnInit} from '@angular/core';
import Card, {Validator} from "../../../../interfaces/card";
import {filter} from "rxjs/operators";
import {DeckService} from "../../../../services/deck.service";
import {ConstService} from "../../../../services/const.service";

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
    public CONST = ConstService.CONST;

    @Input()
    public card: Card;

    @Input()
    public cardId: string;

    @Input()
    small: boolean = false;

    @Input()
    submittedType = '';

    imageObservable: any;

    activityTypes: string;

    constructor(private deckService: DeckService) { }

    ngOnInit() {
        if(this.card) {
            this.activityTypes = this.resolveActivityTypes(this.card.validators)
        }
        if(this.cardId) {
            this.deckService.cards.pipe(filter(cards => cards.length)).subscribe(async _ =>{
                this.card = this.deckService.getCard(this.cardId)
                this.activityTypes = this.resolveActivityTypes(this.card.validators)
            })
        }
    }

    resolveActivityTypes(validators: Validator[]): string {
        return (validators.find(validator => validator.property === ConstService.CONST.ACTIVITY_PROPERTIES.TYPE)?.formula) || '';
    }

}
