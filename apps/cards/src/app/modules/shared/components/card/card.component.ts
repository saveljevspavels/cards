import {Component, Input, OnChanges, OnInit} from '@angular/core';
import Card, {Validator} from "../../../../../../../shared/interfaces/card.interface";
import {filter} from "rxjs/operators";
import {ConstService} from "../../../../services/const.service";
import {UtilService} from "../../../../services/util.service";
import {CardService} from "../../../../services/card.service";
import {Progression} from "../../../../../../../shared/interfaces/card-factory.interface";
import {ValidationStatus} from "../../../../../../../shared/services/validation.service";

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit, OnChanges {
    public PROGRESSION = Progression;
    public RULES = ConstService.RULES;

    @Input()
    public card: Card;

    @Input()
    public cardId: string;

    @Input()
    public filterData: any;

    @Input()
    public showDescription = true;

    @Input()
    small: boolean = false;

    @Input()
    energy: number;

    @Input()
    validationStatus: ValidationStatus = ValidationStatus.NONE;

    imageObservable: any;
    visible = true;

    activityTypes: string;

    constructor(private cardService: CardService) { }

    ngOnInit() {
        if(this.card) {
            this.initCard();
        }
        if(this.cardId) {
            this.cardService.cards.pipe(filter(cards => !!cards.length)).subscribe(async _ =>{
                this.card = this.cardService.getCard(this.cardId)
                this.initCard();
            })
        }

    }

    ngOnChanges() {
        this.checkFilter()
    }

    initCard() {
        this.checkFilter();
        this.activityTypes = this.resolveActivityTypes(this.card.validators)
    }

    checkFilter() {
        if(!this.filterData) {
            return;
        }
        const typeValidator = this.card.validators.find(validator => validator.property === ConstService.CONST.ACTIVITY_PROPERTIES.TYPE);
        this.visible = (this.filterData.filterActivity === 'all'
            || !typeValidator
            || (typeValidator?.formula.indexOf(this.filterData.filterActivity) !== -1 && typeValidator?.comparator === ConstService.CONST.COMPARATORS.IN)
            || (typeValidator?.formula.indexOf(this.filterData.filterActivity) === -1 && typeValidator?.comparator === ConstService.CONST.COMPARATORS.NOT_IN))
            &&
            (this.filterData['filterLevel_' + UtilService.getTier(this.card.value)])
    }

    resolveActivityTypes(validators: Validator[]): string {
        return (validators?.find(validator => validator.property === ConstService.CONST.ACTIVITY_PROPERTIES.TYPE)?.formula) || '';
    }

}
