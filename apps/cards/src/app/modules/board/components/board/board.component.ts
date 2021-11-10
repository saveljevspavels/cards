import { Component, OnInit } from '@angular/core';
import {ActivityService} from "../../../../services/activity.service";
import {BoardService} from "../../../../services/board.service";
import {Router} from "@angular/router";
import {LocalStorageService} from "../../../../services/local-storage.service";

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

    public newActivities = this.activityService.newActivities;
    public openStates: any = {
        pendingActivities: true,
        cardQueue: true,
        rules: true,
    }

    constructor(private activityService: ActivityService,
                private boardService: BoardService,
                private router: Router) { }

    ngOnInit(): void {
        Object.keys(this.openStates).forEach(key => {
            this.openStates[key] = LocalStorageService.getState(key)
        })
    }

    enterSubmitMode(activity: any) {
        this.boardService.activity = activity;
        this.router.navigateByUrl(`board/submit-activity`)
    }

    openRules() {
        LocalStorageService.setObject({rules: false});
        this.router.navigateByUrl(`board/rules`)
    }

    rejectActivity(activityId: string) {
        this.activityService.rejectActivity(activityId, 'Cancelled by athlete').subscribe()
    }

    saveState(state: boolean, item: string) {
        const obj: any = {};
        obj[item] = state;
        LocalStorageService.setObject(obj);
    }

}
