import { Component } from '@angular/core';
import {ChallengeService} from "../../../../services/challenge.service";
import {combineLatest} from "rxjs";
import {ProgressiveChallenge} from "../../../../../../../shared/interfaces/progressive-challenge.interface";
import {RULES} from "../../../../../../../../definitions/rules";
import {ACHIEVEMENTS} from "../../../../../../../../definitions/achievements";

@Component({
    selector: 'app-achievements',
    templateUrl: './achievements.component.html',
    styleUrl: './achievements.component.css',
})
export class AchievementsComponent {

    public achievements: ProgressiveChallenge[] = [];
    public challengeValues: {[key: string]: number} = {};
    public claimedChallenges: string[] = [];

    constructor(
        private challengeService: ChallengeService
    ) {
        this.challengeService.myProgress$.subscribe((progress) => {
            this.achievements = ACHIEVEMENTS;
            this.challengeValues = progress.challengeValues || {};
            this.claimedChallenges = progress.claimedChallenges || [];
        });
    }

    claimChallenge(challengeId: String): void {
        this.challengeService.claimChallenge(challengeId).subscribe(() => {});
    }
}
