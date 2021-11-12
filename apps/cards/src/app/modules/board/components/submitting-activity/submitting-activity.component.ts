import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BoardService} from "../../../../services/board.service";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {ActivityService} from "../../../../services/activity.service";
import {FileService} from "../../../../services/file.service";
import {ActivatedRoute, Router} from "@angular/router";
import {PopupService} from "../../../../services/popup.service";
import {mergeMap} from "rxjs/operators";
import {CONST} from "../../../../app.module";

@Component({
  selector: 'app-submitting-activity',
  templateUrl: './submitting-activity.component.html',
  styleUrls: ['./submitting-activity.component.scss']
})
export class SubmittingActivityComponent implements OnInit, OnDestroy {

    @ViewChild('submitPopup', { static: true }) submitPopup: ElementRef;
    @ViewChild('deletePopup', { static: true }) deletePopup: ElementRef;

    public selectedActivity = this.boardService.selectedActivity$;

    public form: FormGroup;

    constructor(private activityService: ActivityService,
                private formBuilder: FormBuilder,
                private fileService: FileService,
                private boardService: BoardService,
                private router: Router,
                private popupService: PopupService) {}

    ngOnInit(): void {
        if(!this.boardService.activity) {
            this.exitSubmitMode();
        }
        this.initForm()
    }

    async submitSelectedActivity() {
        const uploadedImages = await this.fileService.uploadImages(this.form.value.selectedImages)
        this.activityService.submitActivity(
            this.boardService.activity.id.toString(),
            this.form.value.selectedCards,
            uploadedImages,
            this.form.value.comments.slice(0, CONST.COMMENT_LENGTH),
        ).pipe(mergeMap(() => this.popupService.showPopup(this.submitPopup, 2500)))
        .subscribe(() => {
            this.initForm()
            this.exitSubmitMode();
        })
    }

    exitSubmitMode() {
        this.router.navigateByUrl('board');
        this.boardService.deselectActivity();
    }

    openDeletePopup() {
        this.popupService.showPopup(this.deletePopup)
    }

    cancelDelete() {
        this.popupService.popup = null;
    }

    deleteActivity() {
        this.activityService.deleteActivity(this.boardService.activity.id).subscribe(() => {
            this.popupService.popup = null;
            this.router.navigateByUrl('board');
            this.boardService.deselectActivity();
        });
    }

    initForm() {
        this.form = this.formBuilder.group({
            selectedCards: [[]],
            selectedImages: [[]],
            selectedActivity: [''],
            comments: ['']
        })
    }

    ngOnDestroy() {
        this.boardService.deselectActivity();
    }
}
