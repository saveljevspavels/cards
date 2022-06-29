import { Component, OnInit } from '@angular/core';
import {ActivityService} from "../../../../services/activity.service";
import {AdminService} from "../../admin.service";
import {FormControl} from "@angular/forms";
import {SwPush} from "@angular/service-worker";
import {PushNotificationsService} from "../../../../services/pushNotifications.service";

@Component({
  selector: 'app-activity-review',
  templateUrl: './activity-review.component.html',
  styleUrls: ['./activity-review.component.scss']
})
export class ActivityReviewComponent implements OnInit {

      readonly VAPID_PUBLIC_KEY = "BDQA6SPOLuzPpM5Xtbrb9rQIGpmw7D5xT_MMyRNQ1saBICwNY7gn7HVunm7nTUcU9DhNd_h1CFjJpZH88tmQmKU";

      public submittedActivities = this.adminService.submittedActivities;
      public selectedCards = []
      public rejectionComment = new FormControl('')

      constructor(private adminService: AdminService,
                  private activityService: ActivityService,
                  private swPush: SwPush,
                  private pushNotificationsService: PushNotificationsService) { }

      ngOnInit() {
          this.swPush.requestSubscription({
              serverPublicKey: this.VAPID_PUBLIC_KEY
          })
              .then(sub => this.pushNotificationsService.submitActivity(sub).subscribe())
              .catch(err => console.error("Could not subscribe to notifications", err));
      }

      rejectActivity(activityId: string) {
          this.activityService.rejectActivity(activityId, this.rejectionComment.value).subscribe(_ => {
              this.rejectionComment.reset()
          })
      }

      approveActivity(activityId: string, cardIds: string[]) {
          this.adminService.approveActivity(activityId, cardIds).subscribe()
      }
}
