import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import {Card} from "../../../../../../../shared/classes/card.class";
import {filter} from "rxjs/operators";
import {ConstService} from "../../../../services/const.service";
import {UtilService} from "../../../../services/util.service";
import {CardService} from "../../../../services/card.service";
import {ValidationStatus} from "../../../../../../../shared/services/validation.service";
import {FormControl} from "@angular/forms";
import {Subject} from "rxjs";
import {AthleteService} from "../../../../services/athlete.service";
import {ButtonType} from "../button/button.component";

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit, OnChanges {
    public RULES = ConstService.RULES;
    public ValidationStatus = ValidationStatus;
    readonly ButtonType = ButtonType;

    @Input() public card: Card;
    @Input() public cardId: string;
    @Input() public filterData: any;
    @Input() styleClass: string;
    @Input() energy: number;
    @Input() public imagesController: FormControl;
    @Input() public commentController: FormControl;

    @Input() public showDescription = true;
    @Input() small: boolean = false;
    @Input() canActivate = false;
    @Input() locked = false;
    @Input() showActivate = false;
    @Input() showTags = true;
    @Input() featured = false;

    @Input() validationStatus: ValidationStatus = ValidationStatus.NONE;

    @Output() activated = new EventEmitter;
    @Output() photoClicked = new EventEmitter;

    public uploadTrigger = new Subject();
    public me = this.athleteService.me;

    visible = true;

    constructor(
        private cardService: CardService,
        private athleteService: AthleteService,
    ) { }

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

    ngOnChanges(changes: SimpleChanges) {
        if(!changes.card?.isFirstChange() && changes.card?.previousValue.id !== changes.card?.currentValue.id) {
            this.initCard();
        }
        this.checkFilter()
    }

    initCard() {
        this.checkFilter();
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
            (this.filterData['filterLevel_' + UtilService.getTier(this.card.rewards.points)])
    }

    activate() {
        if(!this.canActivate) {
            return;
        }
        this.activated.emit(this.card);
    }

    addPhoto(event: Event) {
        event.stopPropagation();
        if(this.imagesController) {
            this.uploadTrigger.next(null);
        }
    }
}
