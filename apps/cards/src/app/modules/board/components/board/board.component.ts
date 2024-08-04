import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivityService} from "../../../../services/activity.service";
import {BoardService} from "../../../../services/board.service";
import {Router} from "@angular/router";
import {LocalStorageService} from "../../../../services/local-storage.service";
import {UtilService} from "../../../../services/util.service";
import {TabItem} from "../../../../interfaces/tab-item";
import {ChallengeService} from "../../../../services/challenge.service";
import {distinctUntilChanged, filter} from "rxjs/operators";
import {FormControl} from "@angular/forms";
import {PopupService} from "../../../../services/popup.service";
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

    public challengeUpdates: any = {};

    public progressPopupControl = new FormControl();

    constructor(private activityService: ActivityService,
                private challengeService: ChallengeService,
                private popupService: PopupService,
                private athleteService: AthleteService,
                private router: Router) { }

    ngOnInit(): void {
        Object.keys(this.openStates).forEach(key => {
            this.openStates[key] = LocalStorageService.getState(key)
        })

        this.challengeService.challengeUpdates$.subscribe((updates) => {
            this.challengeUpdates = updates;
            setTimeout(() => {
                this.popupService.showPopup(this.progressPopupControl.value);
            });
        });

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
