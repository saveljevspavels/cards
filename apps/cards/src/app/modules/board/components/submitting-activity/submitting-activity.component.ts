import {Component, OnDestroy, OnInit} from '@angular/core';
import {BoardService} from "../../../../services/board.service";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {ActivityService} from "../../../../services/activity.service";
import {FileService} from "../../../../services/file.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-submitting-activity',
  templateUrl: './submitting-activity.component.html',
  styleUrls: ['./submitting-activity.component.scss']
})
export class SubmittingActivityComponent implements OnInit, OnDestroy {

    public selectedActivity = this.boardService.selectedActivity$;
    public deleteControl = new FormControl(false);

    public form: FormGroup;

    constructor(private activityService: ActivityService,
                private formBuilder: FormBuilder,
                private fileService: FileService,
                private boardService: BoardService,
                private router: Router) {}

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
            this.form.value.comments,
        ).subscribe(() => {
            this.initForm()
            this.exitSubmitMode();
        })
    }

    exitSubmitMode() {
        this.router.navigateByUrl('board');
        this.boardService.deselectActivity();
    }

    deleteActivity() {
        this.activityService.deleteActivity(this.boardService.activity.id).subscribe(() => {
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
