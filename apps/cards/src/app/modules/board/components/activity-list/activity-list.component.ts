import { Component, OnInit } from '@angular/core';
import {ActivityService} from "../../../../services/activity.service";

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {

    public categories = [
        'today',
        'yesterday',
        'previously'
    ]

    public approvedActivities: any = this.getEmptyContainer();

    constructor(private activityService: ActivityService) { }

    ngOnInit(): void {
        this.activityService.approvedActivities.subscribe(activities => {
            this.approvedActivities = this.getEmptyContainer();
            const date = new Date();
            const today = date.toISOString().slice(0, 10)
            const yesterday = new Date(date.setDate((date).getDate() - 1)).toISOString().slice(0, 10)
            activities.forEach((activity: any) => {
                  switch((activity.gameData.submittedAt || activity.start_date).slice(0, 10)) {
                      case today: this.approvedActivities.today.push(activity); break;
                      case yesterday: this.approvedActivities.yesterday.push(activity); break;
                      default: this.approvedActivities.previously.push(activity); break;
                  }
            })
        })
    }

    getEmptyContainer(): any {
        return {
            today: [],
            yesterday: [],
            previously: []
        };
    }

}
