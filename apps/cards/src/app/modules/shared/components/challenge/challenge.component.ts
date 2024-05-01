import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {
    ChallengeStatType,
    ProgressiveChallenge
} from "../../../../../../../shared/interfaces/progressive-challenge.interface";

@Component({
    selector: 'app-challenge',
    templateUrl: './challenge.component.html',
    styleUrl: './challenge.component.scss',
})
export class ChallengeComponent implements OnChanges {
    public readonly ChallengeStatType = ChallengeStatType;

    @Input() currentProgress: number;
    @Input() challenge: ProgressiveChallenge;

    public progressToShow: number;

    ngOnChanges(changes: SimpleChanges) {
        if(changes.currentProgress) {
            this.progressToShow = Math.min(this.currentProgress, this.challenge.targetValue);
        }
    }
}
