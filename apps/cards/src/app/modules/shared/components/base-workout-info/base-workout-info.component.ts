import {Component, Input, OnInit} from '@angular/core';
import * as RULES from 'definitions/rules.json';

@Component({
    selector: 'app-base-workout-info',
    templateUrl: './base-workout-info.component.html',
    styleUrls: ['./base-workout-info.component.scss']
})
export class BaseWorkoutInfoComponent implements OnInit {

    rules = RULES;

    activityTypes: string[] = [];

    @Input() public showPersonalBests = true;
    @Input() public baseWorkout: any;
    @Input() public self = false;

    public personalBests = [
        {
            title: '3km distance',
            property: 'time_3k'
        },
        {
            title: '5km distance',
            property: 'time_5k'
        },
        {
            title: '10km distance',
            property: 'time_10k'
        },
        {
            title: '40km distance',
            property: 'time_40k'
        }
    ]

    constructor() { }

    ngOnInit(): void {
    }

}
