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
    selector: 'app-card-snapshot',
    templateUrl: './card-snapshot.component.html',
    styleUrls: ['./card-snapshot.component.scss'],
})
export class CardSnapshotComponent {
    readonly ButtonType = ButtonType;

    @Input() public card: CardSnapshot;
    @Input() public activity: Activity;
    @Input() public activityType: string;
    @Input() public showGallery = true;
    @Input() public showActions = true;

    @Input() public showReports = false;

    @Output() public reported = new EventEmitter();
    @Output() public liked = new EventEmitter();
    @Output() public openComments = new EventEmitter();

    constructor() {}

    like(cardSnapshot: CardSnapshot) {
        this.liked.emit(cardSnapshot);
        cardSnapshot.likedByMe = true;
    }

    report(cardId: string) {
        this.reported.emit(cardId);
    }
}
