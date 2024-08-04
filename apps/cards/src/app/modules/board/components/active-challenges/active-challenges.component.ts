import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ChallengeService} from "../../../../services/challenge.service";
import {combineLatest} from "rxjs";
import {ProgressiveChallenge} from "../../../../../../../shared/interfaces/progressive-challenge.interface";
import {RULES} from "../../../../../../../../definitions/rules";
import {ChallengeProgress} from "../../../../../../../shared/classes/challenge-progress";

@Component({
    selector: 'app-active-challenges',
    templateUrl: './active-challenges.component.html',
    styleUrl: './active-challenges.component.css',
})
export class ActiveChallengesComponent implements OnChanges, OnInit {

    @Input() updates: {
        previous: {[key: string]: number},
        current: {[key: string]: number}
    }

    public activeChallenges: ProgressiveChallenge[] = [];
    public challengeValues: {[key: string]: number} = {};

    constructor(
        private challengeService: ChallengeService
    ) {
    }

    ngOnInit() {
        if(this.updates) {
            return;
        }
        combineLatest([
            this.challengeService.activeChallenges,
            this.challengeService.myProgress$
        ]).subscribe(([challenges, progress]) => {
            this.activeChallenges = challenges;
            this.challengeValues = progress.challengeValues || {};
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if(this.updates.current) {
            this.challengeService.activeChallenges.subscribe(challenges => {
                this.activeChallenges = challenges
                    .filter(challenge => this.updates ? Object.keys(this.updates.current).indexOf(challenge.id) !== -1 : true);
                this.challengeValues = this.updates.current;
            });
        }
    }

    claimChallenge(challengeId: String): void {
        this.challengeService.claimChallenge(challengeId).subscribe(() => {});
    }
}
