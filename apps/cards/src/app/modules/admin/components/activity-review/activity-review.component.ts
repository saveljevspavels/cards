import { Component, OnInit } from '@angular/core';
import {ActivityService} from "../../../../services/activity.service";
import {AdminService} from "../../admin.service";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-activity-review',
  templateUrl: './activity-review.component.html',
  styleUrls: ['./activity-review.component.scss']
})
export class ActivityReviewComponent implements OnInit {

      public submittedActivities = this.adminService.submittedActivities;
      public selectedCards = []
      public rejectionComment = new FormControl('')

      constructor(private adminService: AdminService,
                  private activityService: ActivityService) { }

      ngOnInit() {}

      rejectActivity(activityId: string) {
          this.activityService.rejectActivity(activityId, this.rejectionComment.value).subscribe(_ => {
              this.rejectionComment.reset()
          })
      }

      approveActivity(activityId: string, cardIds: string[]) {
          this.adminService.approveActivity(activityId, cardIds).subscribe()
      }
}
