import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {AdminService} from "../../admin.service";
import {ConstService} from "../../../../services/const.service";
import {BehaviorSubject} from "rxjs";
import {RULES} from "../../../../../../../../definitions/rules";
import CardInterface from "../../../../../../../shared/interfaces/card";
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
    public selectedCards = new FormControl([]);
    public allCards: BehaviorSubject<CardInterface[]> = this.cardService.cards;
    public cardScheme: BehaviorSubject<CardScheme> = this.cardService.cardScheme;

    public cardMap: Map<string, CardInterface>

    public form: FormArray;

    constructor(private formBuilder: FormBuilder,
                private adminService: AdminService,
                private cardService: CardService) { }

    ngOnInit(): void {
        this.cardScheme.subscribe((cardScheme) => {
            this.form = this.initForm(cardScheme);
        })
        this.allCards.subscribe((cards) => {
            this.cardMap = new Map<string, CardInterface>(cards.map(card => {
                return [card.id, card]
            }))
        })
    }

    async saveSchema() {
        this.adminService.saveSchema({boards: this.form.value}).subscribe(() => {
            console.log('saved', this.form.value)
        })
    }

    initForm(cardScheme: CardScheme) {
        const form: FormArray = this.formBuilder.array([]);
        for(let i = 0; i < (cardScheme.boards.length || RULES.SCHEME.BOARDS_NUMBER); i++) {
            const boardControl = this.formBuilder.group({
                title: [cardScheme.boards[i] ? cardScheme.boards[i].title : ''],
                levels: this.formBuilder.array([])
            })
            for(let j = 0; j < 5; j++) {
                (boardControl.get('levels') as FormArray).push(
                    this.formBuilder.group({
                        cards: [cardScheme.boards[i] ? cardScheme.boards[i].levels[j].cards : []]
                    })
                )
            }
            form.push(boardControl);
        }
        return form;
    }

    addCards(level: FormGroup) {
        const currentValue = level.get('cards')?.value;
        level.get('cards')?.setValue([...currentValue, ...this.selectedCards.value])
        this.selectedCards.setValue([]);
    }

    removeCard(level: FormGroup, cardId: string) {
        const currentValue = level.get('cards')?.value;
        currentValue.splice(currentValue.indexOf(cardId), 1);
        level.get('cards')?.setValue(currentValue)
    }

}
