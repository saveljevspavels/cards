import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivityService} from "../../../../services/activity.service";
import {BoardService} from "../../../../services/board.service";
import {Router} from "@angular/router";
import {LocalStorageService} from "../../../../services/local-storage.service";
import {UtilService} from "../../../../services/util.service";
import {TabItem} from "../../../../interfaces/tab-item";

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

    public tabs: TabItem[] = [
        {
            title: 'Main Tasks',
            path: '/board/main/tasks'
        },
        {
            title: 'Daily Challenges',
            path: '/board/main/challenges'
        }
    ]

    public openStates: any = {
        rules: true,
    }

    public saveState = UtilService.saveState;

    constructor(private activityService: ActivityService,
                private boardService: BoardService,
                private router: Router) { }

    ngOnInit(): void {
        Object.keys(this.openStates).forEach(key => {
            this.openStates[key] = LocalStorageService.getState(key)
        })
    }

    openRules() {
        LocalStorageService.setObject({rules: false});
        this.router.navigateByUrl(`board/rules`)
    }

    rejectActivity(activityId: string) {
        this.activityService.rejectActivity(activityId, 'Cancelled by athlete').subscribe()
    }

}
