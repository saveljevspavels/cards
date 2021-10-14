import { Component, OnInit } from '@angular/core';
import {ActivityService} from "../../../../services/activity.service";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {FileService} from "../../../../services/file.service";

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

    public newActivities = this.activityService.newActivities;

    public activityToSubmit = null;

    public form: FormGroup;

    constructor(private activityService: ActivityService,
                private formBuilder: FormBuilder,
                private fileService: FileService) { }

    ngOnInit(): void {
        this.initForm()
    }

    enterSubmitMode(activity: any) {
        this.activityToSubmit = activity;
    }

    exitSubmitMode() {
        this.activityToSubmit = null;
    }

    async submitActivity(activityId: string) {
        const uploadedImages = await this.fileService.uploadImages(this.form.value.selectedImages)
        this.activityService.submitActivity(
            activityId,
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

}
