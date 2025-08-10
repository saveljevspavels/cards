import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input, OnChanges,
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
import { ActivityService } from '../../../../services/activity.service';

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
export class ActivityComponent implements ControlValueAccessor, OnChanges {
    public CONST = ConstService.CONST;
    public myId = this.athleteService.myId.value;
    readonly ButtonType = ButtonType;

    public selectedCard : CardSnapshot | null;
    public imageObservables: any;
    public activityType = '';
    public validationService = StaticValidationService;

    @ViewChild('commentsPopup', { static: true }) commentsPopup: ElementRef;
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
        private popupService: PopupService,
        private activityService: ActivityService
    ) { }

    ngOnChanges(changes: SimpleChanges) {
        if(changes.activity) {
            this.activityType = StaticValidationService.normalizeActivityType(this.activity);
            if(!this.activity.gameData) {
                return;
            }
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

    openComments(card: CardSnapshot) {
        this.popupService.showPopup(this.commentsPopup);
        this.selectedCard = card;
    }

    closeComments() {
        this.popupService.closePopup();
        this.selectedCard = null;
    }

    like(cardSnapshot: CardSnapshot) {
        this.liked.emit(cardSnapshot.id);
    }
    showMap() {
        this.popupService.showPopup(this.mapViewPopup);
    }

    cardTrackBy(index: number, item: CardSnapshot){
        return item.id;
    }
}
