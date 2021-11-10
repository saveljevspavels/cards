import {Component, Input, OnInit} from '@angular/core';
import {RULES} from "../../../../app.module";

@Component({
    selector: 'app-base-workout-info',
    templateUrl: './base-workout-info.component.html',
    styleUrls: ['./base-workout-info.component.scss']
})
export class BaseWorkoutInfoComponent implements OnInit {

    rules = RULES;

    @Input() public baseWorkout: any;
    @Input() public self = false;

    constructor() { }

    ngOnInit(): void {
    }

}
