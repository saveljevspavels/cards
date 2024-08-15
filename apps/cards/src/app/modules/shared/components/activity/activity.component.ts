import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input, OnChanges,
    OnInit,
    Output, SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {PopupService} from "../../../../services/popup.service";
import {ConstService} from "../../../../services/const.service";
import {CONST} from "../../../../../../../../definitions/constants";
import {StaticValidationService} from "../../../../../../../shared/services/validation.service";
import {AthleteService} from "../../../../services/athlete.service";
import {CardSnapshot, Report} from "../../../../../../../shared/classes/card.class";
import {ButtonType} from "../button/button.component";
import {Activity} from "../../../../../../../shared/interfaces/activity.interface";
import Athlete from "../../../../../../../shared/classes/athlete.class";

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
export class ActivityComponent implements OnInit, ControlValueAccessor, OnChanges {
    public CONST = ConstService.CONST;
    public myId = this.athleteService.myId.value;
    readonly ButtonType = ButtonType;

    public selectedCards = new FormControl([])
    public imageObservables: any;
    public activityType = '';
    public validationService = StaticValidationService;

    @ViewChild('mapViewPopup', { static: true }) mapViewPopup: ElementRef;

    @Input() public activity: Activity;
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

    ngOnInit() {
        this.selectedCards.valueChanges.subscribe((value) => {
            this._onChange(value)
        })
    }

    ngOnChanges(changes: SimpleChanges) {
        if(changes.activity) {
            this.activityType = StaticValidationService.normalizeActivityType(this.activity);
            if(!this.activity.gameData) {
                return;
            }
            this.activity.gameData.cardSnapshots = this.activity.gameData?.cardSnapshots.map((cardSnapshot: CardSnapshot) => CardSnapshot.fromJSONObject(cardSnapshot));
            this.activity.gameData?.cardSnapshots.forEach((cardSnapshot: CardSnapshot) => {
                cardSnapshot.likedByMe = (cardSnapshot?.likes && cardSnapshot?.likes?.indexOf(this.myId) !== -1);
                cardSnapshot.reportedByMe = !!cardSnapshot?.reports?.length && !!cardSnapshot?.reports?.find((report: Report) => report.createdBy === this.myId);
            });
        }
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

    like(cardSnapshot: CardSnapshot) {
        this.liked.emit(cardSnapshot.id);
        cardSnapshot.likedByMe = true;
    }

    showMap() {
        this.popupService.showPopup(this.mapViewPopup);
    }

    cardTrackBy(index: number, item: CardSnapshot){
        return item.id;
    }
}
