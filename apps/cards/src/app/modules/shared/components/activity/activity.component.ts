import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {PopupService} from "../../../../services/popup.service";
import {ConstService} from "../../../../services/const.service";
import {UtilService} from "../../../../services/util.service";
import {CONST} from "../../../../../../../../definitions/constants";
import {StaticValidationService} from "../../../../../../../shared/services/validation.service";
import {AthleteService} from "../../../../services/athlete.service";
import {CardSnapshot} from "../../../../../../../shared/interfaces/card.interface";

@Component({
    selector: 'app-activity',
    templateUrl: './activity.component.html',
    styleUrls: ['./activity.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ActivityComponent),
        multi: true,
    }],
    encapsulation: ViewEncapsulation.None
})
export class ActivityComponent implements OnInit, ControlValueAccessor {
    public CONST = ConstService.CONST;
    public myId = this.athleteService.myId.value;

    public selectedCards = new FormControl([])
    public imageObservables: any;
    public activityType = '';
    public validationService = StaticValidationService;

    @ViewChild('mapViewPopup', { static: true }) mapViewPopup: ElementRef;

    @Input() public activity: any;
    @Input() public selection = false;
    @Input() public showImages = true;
    @Input() public showComments = false;
    @Input() public showReports = false;
    @Input() public collapsible = false;

    @Output() public reported = new EventEmitter;
    @Output() public liked = new EventEmitter;

    public activityVerbMap = new Map<string, string>([
        [CONST.ACTIVITY_TYPES.OTHER, 'exercised for'],
        [CONST.ACTIVITY_TYPES.RUN, 'ran'],
        [CONST.ACTIVITY_TYPES.RIDE, 'rode'],
        [CONST.ACTIVITY_TYPES.WALK, 'walked'],
    ]);

    constructor(
        private athleteService: AthleteService,
        private popupService: PopupService
    ) { }

    async ngOnInit() {
        this.selectedCards.valueChanges.subscribe((value) => {
            this._onChange(value)
        })
        this.activityType = UtilService.normalizeActivityType(this.activity.type);
    }

    _onChange: any = () => {};
    _onTouched: any = () => {};

    writeValue(value: any) {}

    registerOnChange(fn: any) {
        this._onChange = fn;
    }

    registerOnTouched(fn: any) {
        this._onTouched = fn;
    }

    report(cardId: string) {
        this.reported.emit(cardId);
    }

    like(cardId: string) {
        this.liked.emit(cardId);
        this.liked.unsubscribe()
    }

    showMap() {
        this.popupService.showPopup(this.mapViewPopup);
    }

    cardTrackBy(index: number, item: CardSnapshot){
        return item.id;
    }
}
