import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {ConstService} from "../../../../services/const.service";
import {BehaviorSubject} from "rxjs";
import Card from "../../../../../../../shared/interfaces/card.interface";
import {CardScheme} from "../../../../../../../shared/interfaces/card-scheme.interface";
import {CardService} from "../../../../services/card.service";

@Component({
  selector: 'app-card-scheme',
  templateUrl: './card-scheme.component.html',
  styleUrls: ['./card-scheme.component.scss']
})
export class CardSchemeComponent implements OnInit {
    public CONST = ConstService.CONST
    public RULES = ConstService.RULES
    public allCards: BehaviorSubject<Card[]> = this.cardService.cards;
    public cardScheme: BehaviorSubject<CardScheme> = this.cardService.cardScheme;

    public cardMap: Map<string, Card>

    public selectedCard: FormControl = this.formBuilder.control([]);

    constructor(private formBuilder: FormBuilder,
                private cardService: CardService) { }

    ngOnInit(): void {
        this.allCards.subscribe((cards) => {
            this.cardMap = new Map<string, Card>(cards.map(card => {
                return [card.id, card]
            }))
        })
    }

    activateCard(cardId: string) {
        if(!cardId) {
            return;
        }
        this.cardService.activateCard(cardId).subscribe();
    }
}
