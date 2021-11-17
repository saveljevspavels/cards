import { Component, OnInit } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {AthleteService} from "../../../../services/athlete.service";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {PERMISSIONS} from "../../../../constants/permissions";
import {RULES} from "../../../../app.module";

@Component({
    selector: 'app-athlete-management',
    templateUrl: './athlete-management.component.html',
    styleUrls: ['./athlete-management.component.scss']
})
export class AthleteManagementComponent implements OnInit {

    public PERMISSIONS = PERMISSIONS;
    public selectedAthletes = new FormControl([]);
    public selectedPermissions = new FormControl([]);
    public allAthletes: BehaviorSubject<any> = this.athleteService.athletes;

    public form = this.formBuilder.group(Object.keys(RULES.DEFAULT_BASE_WORKOUT).reduce((acc: any, property: string) => {
        acc[property] = [0, [Validators.min(0)]]
        return acc
    }, {}))

    constructor(
        private athleteService: AthleteService,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit(): void {
    }

    updateBaseWorkout() {
        this.athleteService.updateBaseWorkout(
            this.selectedAthletes.value,
            Object.entries(this.form.value).reduce((acc: any, entry) => {
                if(entry[1]) {
                    acc[entry[0]] = entry[1];
                }
                return acc;
            }, {})
        ).subscribe()
    }

    setPermissions() {
        this.athleteService.setPermissions(this.selectedAthletes.value, this.selectedPermissions.value).subscribe()
    }
}
