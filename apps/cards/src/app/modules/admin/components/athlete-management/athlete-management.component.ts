import { Component, OnInit } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {AthleteService} from "../../../../services/athlete.service";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {PERMISSIONS} from "../../../../constants/permissions";
import {CONST, RULES} from "../../../../app.module";
import {UtilService} from "../../../../services/util.service";

@Component({
    selector: 'app-athlete-management',
    templateUrl: './athlete-management.component.html',
    styleUrls: ['./athlete-management.component.scss']
})
export class AthleteManagementComponent implements OnInit {

    public PERMISSIONS = PERMISSIONS;
    public ACTIVITY_TYPES = CONST.ACTIVITY_TYPES;
    public selectedAthletes = new FormControl([]);
    public selectedType = new FormControl([]);
    public selectedPermissions = new FormControl([]);
    public allAthletes: BehaviorSubject<any> = this.athleteService.athletes;

    // @ts-ignore
    public form = this.formBuilder.group(
        UtilService.getFlatKeys(RULES.DEFAULT_BASE_WORKOUT).reduce((acc: any, property: string) => {
            acc[property] = [0, [Validators.min(0)]]
            return acc
        }, {})
    )

    constructor(
        private athleteService: AthleteService,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit(): void {
    }

    updateBaseWorkout() {
        const baseWorkoutPatch: any = {};
        baseWorkoutPatch[this.selectedType.value[0]] = Object.entries(this.form.value).reduce((acc: any, entry: any) => {
            if(entry[1] > 0) {
                acc[entry[0]] = parseFloat(entry[1]);
            }
            return acc;
        }, {})
        this.athleteService.updateBaseWorkout(
            this.selectedAthletes.value,
            baseWorkoutPatch
        ).subscribe()
    }

    setPermissions() {
        this.athleteService.setPermissions(this.selectedAthletes.value, this.selectedPermissions.value).subscribe()
    }
}
