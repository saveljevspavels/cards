import { Component, OnInit } from '@angular/core';
import {ActivityService} from "../../../../services/activity.service";
import {AdminService} from "../../admin.service";
import {FormControl} from "@angular/forms";
import {SwPush} from "@angular/service-worker";
import {PushNotificationsService} from "../../../../services/pushNotifications.service";
import {CONST} from "../../../../../../../../definitions/constants";
import {DeckService} from "../../../../services/deck.service";
import Card from "../../../../../../../shared/interfaces/card";
import {UtilService} from "../../../../services/util.service";

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

    public stats: any = {
        activityAmount: 0,
        totalTime: 0,
        totalDistance: 0,
        run: {
            activityAmount: 0,
            totalTime: 0,
            totalDistance: 0,
        },
        ride: {
            activityAmount: 0,
            totalTime: 0,
            totalDistance: 0,
        },
        walk: {
            activityAmount: 0,
            totalTime: 0,
            totalDistance: 0,
        },
        other: {
            activityAmount: 0,
            totalTime: 0,
            totalDistance: 0,
        }
    };

    constructor(private adminService: AdminService,
                private activityService: ActivityService,
                private swPush: SwPush,
                private deckService: DeckService,
                private pushNotificationsService: PushNotificationsService) { }

    ngOnInit() {
        this.swPush.requestSubscription({
            serverPublicKey: this.VAPID_PUBLIC_KEY
        })
            .then(sub => this.pushNotificationsService.submitActivity(sub).subscribe())
            .catch(err => console.error("Could not subscribe to notifications", err));

        this.activityService.approvedActivities.subscribe(activities => {
            console.log('activities', activities)
            this.stats.activityAmount = activities.length;
            this.stats.totalTime = activities.reduce((acc: any, i: any) => {
                acc = Math.floor(acc + i.elapsed_time);
                return acc;
            }, 0);
            this.stats.totalDistance = activities.reduce((acc: any, i: any) => {
                acc = Math.floor(acc + i.distance);
                return acc;
            }, 0);
            activities.forEach((activity: any) => {
                const type = Object.values(CONST.ACTIVITY_TYPES).find((activityType) => activity.type.toUpperCase().indexOf(activityType.toUpperCase()) !== -1) || CONST.ACTIVITY_TYPES.OTHER;
                this.stats[type].activityAmount = this.stats[type].activityAmount + 1;
                this.stats[type].totalDistance = this.stats[type].totalDistance + activity.distance;
                this.stats[type].totalTime = this.stats[type].totalTime + activity.elapsed_time;
            })
            console.log('stats', this.stats)

        })

        this.deckService.cards.subscribe((cards: Card[]) => {
            this.stats.cards = UtilService.sortByProp(
                cards.map(card => {
                    return {
                        title: card.title,
                        uses: card.cardUses.progression
                    }
                })
            )
        })

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
