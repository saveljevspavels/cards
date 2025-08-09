import {Component, OnInit} from '@angular/core';
import {ActivityService} from "../../../../services/activity.service";
import {Router} from "@angular/router";
import {LocalStorageService} from "../../../../services/local-storage.service";
import {TabItem} from "../../../../interfaces/tab-item";
import {AthleteService} from "../../../../services/athlete.service";
import { ChallengeService } from '../../../../services/challenge.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

    public tabs: TabItem[] = [];

    public openStates: any = {
        rules: true,
    }

    constructor(private activityService: ActivityService,
                private athleteService: AthleteService,
                private challengeService: ChallengeService,
                private router: Router) { }

    ngOnInit(): void {
        Object.keys(this.openStates).forEach(key => {
            this.openStates[key] = LocalStorageService.getState(key)
        })

        this.challengeService.hasRewards.subscribe((hasRewards) => {
            this.createTabs(hasRewards);
        });
    }

    openRules() {
        LocalStorageService.setObject({rules: false});
        this.router.navigateByUrl(`board/rules`)
    }

    rejectActivity(activityId: string) {
        this.activityService.rejectActivity(activityId, 'Cancelled by athlete').subscribe()
    }

    createTabs(hasRewards: boolean) {
        this.tabs = [
            {
                title: 'Main Tasks',
                path: '/board/main/tasks'
            },
            {
                title: 'Daily Challenges',
                path: '/board/main/challenges',
                hasUpdates: hasRewards,
            }
        ]
    }
}
