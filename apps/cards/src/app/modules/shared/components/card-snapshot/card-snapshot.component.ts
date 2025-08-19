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
import { FileService } from '../../../../services/file.service';
import { MessageService } from 'primeng/api';

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

    @ViewChild('addImagesPopup', { static: true }) addImagesPopup: ElementRef;

    public imagesController = new FormControl([]);

    constructor(private popupService: PopupService,
                private fileService: FileService,
                private messageService: MessageService,
                private activityService: ActivityService) {}

    like(cardSnapshot: CardSnapshot) {
        this.liked.emit(cardSnapshot);
        cardSnapshot.likedByMe = true;
    }

    report(cardId: string) {
        this.reported.emit(cardId);
    }

    async addImages()  {
        if(!this.imagesController.value || this.imagesController.value.length === 0) {
            return;
        }
        let groupedImages;
        try {
            groupedImages = await this.fileService.uploadImages(this.imagesController.value);
        } catch (err: any) {
            this.messageService.add({severity:'error', summary:'Error', detail: err.toString()})
            console.error('Error uploading images:', err);
            return;
        }
        this.activityService.addCardPhotos(this.activity.id.toString(), this.card.id, groupedImages).subscribe({
            next: () => {
                this.imagesController.setValue([]);
                this.closeAddImagesPopup();
            },
            error: (err) => {
                console.error('Error adding images:', err);
            }
        });
    }

    openAddImagesPopup() {
        this.popupService.showPopup(this.addImagesPopup);
    }

    closeAddImagesPopup() {
        this.popupService.closePopup();
    }
}
