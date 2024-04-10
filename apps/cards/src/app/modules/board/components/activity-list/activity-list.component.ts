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
        'recent',
        'lastHour',
        'previously'
    ]

    public categoryTitleMap = new Map([
        ['recent', 'Just Now'],
        ['lastHour', 'Last Hour'],
        ['previously', 'Previously'],
    ])

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
            const now = new Date().valueOf();
            activities.forEach((activity: any) => {
                const submittedAt = new Date(activity.gameData.submittedAt).valueOf();
                if((now - submittedAt) < 600000) { // 10min
                    this.approvedActivities.recent.push(activity);
                } else if ((now - submittedAt) < 3600000) { // 1h
                    this.approvedActivities.lastHour.push(activity)
                } else if ((now - submittedAt) < 28800000000) { // 8h
                    this.approvedActivities.previously.push(activity);
                }
            })
        })
    }

    getEmptyContainer(): any {
        return {
            recent: [],
            lastHour: [],
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
            this.cardService.reportCard(cardId, activityId, this.reportComment.value || '').subscribe(_ => {
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
