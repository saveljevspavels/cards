import { Component, OnInit } from '@angular/core';
import {AdminService} from "../../admin.service";
import {FormControl} from "@angular/forms";
import {SwPush} from "@angular/service-worker";
import {PushNotificationsService} from "../../../../services/pushNotifications.service";
import {CardService} from "../../../../services/card.service";

@Component({
  selector: 'app-activity-review',
  templateUrl: './activity-review.component.html',
  styleUrls: ['./activity-review.component.scss']
})
export class ActivityReviewComponent implements OnInit {

    readonly VAPID_PUBLIC_KEY = "BDQA6SPOLuzPpM5Xtbrb9rQIGpmw7D5xT_MMyRNQ1saBICwNY7gn7HVunm7nTUcU9DhNd_h1CFjJpZH88tmQmKU";

    public reportedActivities = this.adminService.reportedActivities;
    public selectedCards = []
    public rejectionComment = new FormControl('')

    constructor(private adminService: AdminService,
                private cardsService: CardService,
                private swPush: SwPush,
                private pushNotificationsService: PushNotificationsService) { }

    ngOnInit() {
        this.swPush.requestSubscription({
            serverPublicKey: this.VAPID_PUBLIC_KEY
        })
            .then(sub => this.pushNotificationsService.submitActivity(sub).subscribe())
            .catch(err => console.error("Could not subscribe to notifications", err));

    }

    rejectCard(cardId: string, activityId: string) {
        this.cardsService.rejectCard(cardId, activityId, this.rejectionComment.value || '').subscribe(_ => {
            this.rejectionComment.reset()
        })
    }

    resolveReport(cardId: string, activityId: string, reportId: string) {
        this.cardsService.resolveReport(cardId, activityId, reportId).subscribe(_ => {
            this.rejectionComment.reset()
        })
    }
}
