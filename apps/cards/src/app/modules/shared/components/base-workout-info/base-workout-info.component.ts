import {Component, Input, OnInit} from '@angular/core';
import {ConstService} from "../../../../services/const.service";
import {UtilService} from "../../../../services/util.service";

@Component({
    selector: 'app-base-workout-info',
    templateUrl: './base-workout-info.component.html',
    styleUrls: ['./base-workout-info.component.scss']
})
export class BaseWorkoutInfoComponent implements OnInit {

    noSort = UtilService.noSort;
    rules = ConstService.RULES;

    activityTypes = ConstService.CONST.ACTIVITY_TYPES;

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
