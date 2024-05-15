import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
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
    @Output() claimChallenge = new EventEmitter<void>();
    public completed: boolean;

    public progressToShow: number;

    ngOnChanges(changes: SimpleChanges) {
        if(changes.currentProgress) {
            this.progressToShow = Math.min(this.currentProgress, this.challenge.targetValue);
            this.completed = this.currentProgress >= this.challenge.targetValue;
        }
    }

    claim(): void {
        this.claimChallenge.emit();
    }
}
