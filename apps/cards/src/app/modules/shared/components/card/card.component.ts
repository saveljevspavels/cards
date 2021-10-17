import {Component, Input, OnInit} from '@angular/core';
import Card from "../../../../interfaces/card";
import {filter} from "rxjs/operators";
import {DeckService} from "../../../../services/deck.service";

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

    @Input()
    public card: Card;

    @Input()
    public cardId: string;

    @Input()
    small: boolean = false;

    imageObservable: any;

    constructor(private deckService: DeckService) { }

    async ngOnInit() {
        if(this.cardId) {
            this.deckService.cards.pipe(filter(cards => cards.length)).subscribe(async _ =>{
                this.card = this.deckService.getCard(this.cardId)
            })
        }
    }

}
