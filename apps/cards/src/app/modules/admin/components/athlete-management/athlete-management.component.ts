import { Component, OnInit } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {AthleteService} from "../../../../services/athlete.service";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {PERMISSIONS} from "../../../../constants/permissions";
import {CONST, RULES} from "../../../../app.module";
import {BaseWorkout} from "../../../../interfaces/athlete";

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
    public form = this.formBuilder.group(Object.values(RULES.DEFAULT_BASE_WORKOUT)
        .reduce((acc: any, properties: any) => {
                acc = {...acc, ...Object.keys(properties).reduce((acc: any, property: string) => {
                        acc[property] = [0, [Validators.min(0)]]
                        return acc
                    }, {}) }
                return acc
            },
            {}
        )
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
            if(entry[1]) {
                acc[entry[0]] = parseInt(entry[1], 10);
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
