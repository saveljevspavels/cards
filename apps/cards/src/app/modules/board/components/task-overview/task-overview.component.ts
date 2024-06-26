import {Component} from "@angular/core";
import {ActivityService} from "../../../../services/activity.service";

@Component({
  selector: 'app-task-overview',
templateUrl: './task-overview.component.html',
styleUrls: ['./task-overview.component.scss']
})
export class TaskOverviewComponent {

    public newActivities = this.activityService.newActivities;
    constructor(
        private activityService: ActivityService,
    ) { }
}