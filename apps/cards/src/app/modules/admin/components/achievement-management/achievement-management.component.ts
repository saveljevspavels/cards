import {Component, OnInit} from '@angular/core';
import {ConstService} from "../../../../services/const.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {FileService} from "../../../../services/file.service";
import {AchievementService} from "../../../../services/achievement.service";
import {Achievement} from "../../../../interfaces/achievement";
import {AthleteService} from "../../../../services/athlete.service";
import {Option} from "../../../../components/select/select.component";
import {CompressionType} from "../../../../../../../shared/interfaces/image-upload.interface";

@Component({
  selector: 'app-achievement-management',
  templateUrl: './achievement-management.component.html',
  styleUrls: ['./achievement-management.component.scss']
})
export class AchievementManagementComponent implements OnInit {
    public CONST = ConstService.CONST
    public achievements = this.achievementService.achievements;

    public form: FormGroup;
    public athleteOptions: Option[] = [];
    public athleteControl = new FormControl('');
    public imageControl = new FormControl([]);

    constructor(private formBuilder: FormBuilder,
                private achievementService: AchievementService,
                private athleteService: AthleteService,
                private fileService: FileService) { }

    ngOnInit(): void {
        this.form = this.initForm();
        this.athleteService.athletes.subscribe((val) => {
            this.athleteOptions = val.map((item) => {
                return {
                    key: `${item.firstname} ${item.lastname}`,
                    value: item.id
                }
            })
        })
    }

    async save() {
        const image = this.imageControl.value?.length ? (await this.fileService.uploadImages(this.imageControl.value || []))[0].urls[CompressionType.REGULAR] : this.form.value?.image;
        this.achievementService.createAchievement({
            ...this.form.value,
            image: image ? image : null
        }).subscribe(() => {
            this.form = this.initForm()
        })
    }

    delete(id: string) {
        this.achievementService.deleteAchievement(id).subscribe(() => {})
    }

    assign(id: string) {
        if(this.athleteControl.value !== null) {
            return;
        }
        this.achievementService.assignAchievement(this.athleteControl.value, id).subscribe(() => {})
    }

    initForm() {
        return this.formBuilder.group({
            id: [''],
            title: ['', [Validators.required]],
            text: ['', [Validators.required]],
            value: [0, [Validators.required]],
            tier: [0, [Validators.required]],
            image: ['', [Validators.required]],
        })
    }

    editAchievement(achievement: Achievement) {
        this.form.patchValue({
            ...achievement,
            image: achievement.image || ''
        });
    }
}
