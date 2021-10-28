import { Component, OnInit } from '@angular/core';
import {ActivityService} from "../../../../services/activity.service";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {FileService} from "../../../../services/file.service";
import {BoardService} from "../../../../services/board.service";

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

    public newActivities = this.activityService.newActivities;
    public selectedActivity = this.boardService.selectedActivity$;

    public form: FormGroup;

    constructor(private activityService: ActivityService,
                private formBuilder: FormBuilder,
                private fileService: FileService,
                private boardService: BoardService) { }

    ngOnInit(): void {
        this.initForm()
    }

    enterSubmitMode(activity: any) {
        this.boardService.activity = activity;
    }

    exitSubmitMode() {
        this.boardService.deselectActivity();
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

    initForm() {
        this.form = this.formBuilder.group({
            selectedCards: [[]],
            selectedImages: [[]],
            comments: ['']
        })
    }

    rejectActivity(activityId: string) {
        this.activityService.rejectActivity(activityId, 'Cancelled by athlete').subscribe()
    }

}
