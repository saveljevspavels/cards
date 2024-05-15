import {Component, Input} from '@angular/core';
import {ActivityType} from "../../../../../../../shared/interfaces/activity.interface";

@Component({
    selector: 'app-challenge-bar',
    templateUrl: './challenge-bar.component.html',
    styleUrl: './challenge-bar.component.scss',
})
export class ChallengeBarComponent {
    public readonly ACTIVITY_TYPE = ActivityType;

    @Input() value: number;
    @Input() target: number;
    @Input() vertical: boolean;
    @Input() activityType: ActivityType;
}
