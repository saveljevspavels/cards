import { Component, OnInit } from '@angular/core';
import {ActivityService} from "../../../../services/activity.service";
import {BoardService} from "../../../../services/board.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

    public newActivities = this.activityService.newActivities;

    constructor(private activityService: ActivityService,
                private boardService: BoardService,
                private router: Router) { }

    ngOnInit(): void {}

    enterSubmitMode(activity: any) {
        this.boardService.activity = activity;
        this.router.navigateByUrl(`board/submit-activity`)
    }

    rejectActivity(activityId: string) {
        this.activityService.rejectActivity(activityId, 'Cancelled by athlete').subscribe()
    }

}
