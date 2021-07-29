import { Component, OnInit } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {AthleteService} from "../../../../services/athlete.service";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {PERMISSIONS} from "../../../../constants/permissions";

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

    public form = this.formBuilder.group({
        RUN: [1, [Validators.min(1), Validators.max(3)]],
        BIKE: [1, [Validators.min(1), Validators.max(3)]]
    })

    constructor(
        private athleteService: AthleteService,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit(): void {
    }

    setDivisions() {
        this.athleteService.setDivisions(this.selectedAthletes.value, this.form.value).subscribe()
    }

    setPermissions() {
        this.athleteService.setPermissions(this.selectedAthletes.value, this.selectedPermissions.value).subscribe()
    }
}
