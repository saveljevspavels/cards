import {Component, OnInit} from '@angular/core';
import {ActivityService} from "../../../../services/activity.service";
import {Router} from "@angular/router";
import {LocalStorageService} from "../../../../services/local-storage.service";
import {TabItem} from "../../../../interfaces/tab-item";
import {AthleteService} from "../../../../services/athlete.service";
import Athlete from "../../../../../../../shared/classes/athlete.class";

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
                private router: Router) { }

    ngOnInit(): void {
        Object.keys(this.openStates).forEach(key => {
            this.openStates[key] = LocalStorageService.getState(key)
        })

        this.athleteService.me.subscribe((me) => {
            if(me) {
                this.createTabs(me);
            }
        });
    }

    openRules() {
        LocalStorageService.setObject({rules: false});
        this.router.navigateByUrl(`board/rules`)
    }

    rejectActivity(activityId: string) {
        this.activityService.rejectActivity(activityId, 'Cancelled by athlete').subscribe()
    }

    createTabs(athlete: Athlete) {
        this.tabs = [
            {
                title: 'Main Tasks',
                path: '/board/main/tasks'
            },
            {
                title: 'Daily Challenges',
                path: '/board/main/challenges',
                hasUpdates: athlete.level > athlete.claimedLevelRewards.length
            }
        ]
    }
}
