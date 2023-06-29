import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivityService} from "../../../../services/activity.service";
import {Subject} from "rxjs";
import {filter, first} from "rxjs/operators";
import {PopupService} from "../../../../services/popup.service";
import {FormControl} from "@angular/forms";
import {CardService} from "../../../../services/card.service";

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {

    @ViewChild('reportPopup', { static: true }) reportPopup: ElementRef;
    private report$ = new Subject();

    public categories = [
        'today',
        'yesterday',
        'previously' // Showing only last 2 days
    ]

    public approvedActivities: any = this.getEmptyContainer();

    public reportComment = new FormControl('');

    constructor(
        private activityService: ActivityService,
        private popupService: PopupService,
        private cardService: CardService
    ) { }

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

    likeCard(cardId: string, activityId: string) {
        this.cardService.likeCard(cardId, activityId).subscribe();
    }

    reportCard(cardId: string, activityId: string) {
        this.report$.pipe(
            first(),
            filter((resolution) => !!resolution)
        ).subscribe(_ => {
            this.cardService.reportCard(cardId, activityId, this.reportComment.value).subscribe(_ => {
                this.reportComment.setValue('');
            });
        })
        this.popupService.showPopup(this.reportPopup);
    }

    confirmReport() {
        this.report$.next(true)
        this.popupService.closePopup();
    }

    cancelReport() {
        this.report$.next(false);
        this.popupService.closePopup();
    }

    activityTrackBy(index: number, item: any){
        return item.id;
    }
}
