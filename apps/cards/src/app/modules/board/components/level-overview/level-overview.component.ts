import { Component, OnInit } from '@angular/core';
import {LEVEL_REWARDS} from "../../../../../../../../definitions/level_rewards";
import {RULES} from "../../../../../../../../definitions/rules";
import {AthleteService} from "../../../../services/athlete.service";
import {ChallengeService} from "../../../../services/challenge.service";

@Component({
  selector: 'app-level-overview',
  templateUrl: './level-overview.component.html',
  styleUrls: ['./level-overview.component.scss']
})
export class LevelOverviewComponent implements OnInit {

    LEVEL_REWARDS = LEVEL_REWARDS;
    LEVEL_EXPERIENCE_COST = RULES.LEVEL_EXPERIENCE;
    public athlete$ = this.athleteService.me;

    constructor(private athleteService: AthleteService,
                private challengeService: ChallengeService,
                ) { }

    ngOnInit(): void {

    }

    claimReward(index: number) {
        this.challengeService.claimLevelReward(index).subscribe();
    }
}
