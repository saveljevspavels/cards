import {Component, OnInit} from '@angular/core';
import {UtilService} from "../../../../services/util.service";
import {ConstService} from "../../../../services/const.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {FileService} from "../../../../services/file.service";
import {AchievementService} from "../../../../services/achievement.service";
import {Achievement} from "../../../../interfaces/achievement";
import {AthleteService} from "../../../../services/athlete.service";
import {Option} from "../../../../components/select/select.component";

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

    constructor(private formBuilder: FormBuilder,
                private achievementService: AchievementService,
                private athleteService: AthleteService) { }

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

    save() {
        this.achievementService.createAchievement(this.form.value).subscribe(() => {
            this.form = this.initForm()
        })
    }

    delete(id: string) {
        this.achievementService.deleteAchievement(id).subscribe(() => {})
    }

    assign(id: string) {
        this.achievementService.assignAchievement(this.athleteControl.value, id).subscribe(() => {})
    }

    initForm() {
        return this.formBuilder.group({
            id: [''],
            title: ['', [Validators.required]],
            text: ['', [Validators.required]],
            value: [0, [Validators.required]],
            tier: [0, [Validators.required]],
        })
    }

    editAchievement(achievement: Achievement) {
        this.form.setValue(achievement);
    }
}
