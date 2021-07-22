import { Component, OnInit } from '@angular/core';
import {AthleteService} from "../../../../services/athlete.service";
import {ActivityService} from "../../../../services/activity.service";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {FileService} from "../../../../services/file.service";

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

    public athlete: any = null;
    public newActivities = this.activityService.newActivities;

    public form: FormGroup;

    constructor(private athleteService: AthleteService,
                private activityService: ActivityService,
                private formBuilder: FormBuilder,
                private fileService: FileService) { }

    ngOnInit(): void {
        this.initForm()
        this.athlete = this.athleteService.me
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
