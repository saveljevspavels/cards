import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {AdminService} from "../../admin.service";
import {ConstService} from "../../../../services/const.service";
import {BehaviorSubject} from "rxjs";
import {RULES} from "../../../../../../../../definitions/rules";
import {Card} from "../../../../../../../shared/classes/card.class";
import {CardScheme} from "../../../../../../../shared/interfaces/card-scheme.interface";
import {CardService} from "../../../../services/card.service";
import {ButtonType} from "../../../shared/components/button/button.component";

@Component({
  selector: 'app-card-scheme-management',
  templateUrl: './card-scheme-management.component.html',
  styleUrls: ['./card-scheme-management.component.scss']
})
export class CardSchemeManagementComponent implements OnInit {
    public CONST = ConstService.CONST
    public RULES = ConstService.RULES
    readonly ButtonType = ButtonType;
    public selectedCards = new FormControl([]);
    public allCards: BehaviorSubject<Card[]> = this.cardService.cards;
    public cardScheme: BehaviorSubject<CardScheme> = this.cardService.cardScheme;

    public cardMap: Map<string, Card>

    public form: FormArray;

    constructor(private formBuilder: FormBuilder,
                private adminService: AdminService,
                private cardService: CardService) { }

    ngOnInit(): void {
        this.cardScheme.subscribe((cardScheme) => {
            this.form = this.initForm(cardScheme);
        })
        this.allCards.subscribe((cards) => {
            this.cardMap = new Map<string, Card>(cards.map(card => {
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
                key: [cardScheme.boards[i] ? cardScheme.boards[i].key : ''],
                title: [cardScheme.boards[i] ? cardScheme.boards[i].title : ''],
                color: [cardScheme.boards[i] ? cardScheme.boards[i].color : ''],
                icon: [cardScheme.boards[i] ? cardScheme.boards[i].icon : ''],
                levels: this.formBuilder.array([])
            })
            for(let j = 0; j < 6; j++) {
                (boardControl.get('levels') as FormArray).push(
                    this.formBuilder.group({
                        cards: [(cardScheme.boards[i] && cardScheme.boards[i].levels && cardScheme.boards[i].levels[j]) ? cardScheme.boards[i].levels[j].cards : []]
                    })
                )
            }
            form.push(boardControl);
        }
        return form;
    }

    addCards(level: FormGroup) {
        if(!this.selectedCards.value?.length) {
            return;
        }
        const currentValue = level.get('cards')?.value;
        level.get('cards')?.setValue([...currentValue, ...(this.selectedCards.value || [])])
        this.selectedCards.setValue([]);
    }

    removeCard(level: FormGroup, cardId: string) {
        const currentValue = level.get('cards')?.value;
        currentValue.splice(currentValue.indexOf(cardId), 1);
        level.get('cards')?.setValue(currentValue)
    }

    deleteCards() {
        if(!this.selectedCards.value?.length) {
            return;
        }
        this.adminService.deleteCards(this.selectedCards.value || [])
    }

}
