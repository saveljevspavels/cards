import { Component } from '@angular/core';
import {ChallengeService} from "../../../../services/challenge.service";
import {combineLatest} from "rxjs";
import {ProgressiveChallenge} from "../../../../../../../shared/interfaces/progressive-challenge.interface";
import {RULES} from "../../../../../../../../definitions/rules";

@Component({
    selector: 'app-active-challenges',
    templateUrl: './active-challenges.component.html',
    styleUrl: './active-challenges.component.css',
})
export class ActiveChallengesComponent {

    public activeChallenges: ProgressiveChallenge[] = [];
    public challengeValues: {[key: string]: number} = {};

    constructor(
        private challengeService: ChallengeService
    ) {
        combineLatest([
            this.challengeService.activeChallenges,
            this.challengeService.myProgress$
        ]).subscribe(([challenges, progress]) => {
            this.activeChallenges = challenges
                .filter(challenge => (progress?.finishedChallenges || []).indexOf(challenge.id) === -1)
                .splice(0, RULES.PROGRESSIVE_CHALLENGE.MAX_ACTIVE);
            this.challengeValues = progress.challengeValues || {};
        });
    }

    finishChallenge(challengeId: String): void {
        this.challengeService.finishChallenge(challengeId).subscribe(() => {});
    }
}
