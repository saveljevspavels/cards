import { Component, OnInit } from '@angular/core';
import {ActivityService} from "../../../../services/activity.service";
import {AdminService} from "../../admin.service";

@Component({
  selector: 'app-activity-review',
  templateUrl: './activity-review.component.html',
  styleUrls: ['./activity-review.component.scss']
})
export class ActivityReviewComponent implements OnInit {

  public submittedActivities = this.adminService.submittedActivities;
  public selectedCards = []

  constructor(private adminService: AdminService) { }

  ngOnInit() {}

  rejectActivity(activityId: string) {
    this.adminService.rejectActivity(activityId).subscribe()
  }

  approveActivity(activityId: string, cardIds: string[]) {
    this.adminService.approveActivity(activityId, cardIds).subscribe()
  }
}
