import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import {ActivityService} from "../../../../services/activity.service";
import { fromEvent, Subject, Subscription } from 'rxjs';
import { debounceTime, filter, first } from 'rxjs/operators';
import {PopupService} from "../../../../services/popup.service";
import {FormControl} from "@angular/forms";
import {CardService} from "../../../../services/card.service";
import { Activity } from '../../../../../../../shared/interfaces/activity.interface';

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
    public total = 0;
    public batchSize = 20;
    public maxItems = this.batchSize;
    public loading = false;

    private scrollSub!: Subscription;
    constructor(
        private activityService: ActivityService,
        private popupService: PopupService,
        private cardService: CardService,
        private ngZone: NgZone
    ) { }

    ngOnInit(): void {
        this.activityService.approvedActivities.subscribe(activities => {
            this.loadItems(activities, this.maxItems);
        })

        // run outside Angular zone to reduce change detection thrash
        this.ngZone.runOutsideAngular(() => {
            this.scrollSub = fromEvent(window, 'scroll')
                .pipe(debounceTime(100)) // debounce scroll events
                .subscribe(() => {
                    this.ngZone.run(() => this.checkScroll());
                });
        });
    }

    loadItems(activities: Activity[], maxItems: number) {
        this.total = activities.length;
        activities.sort((a, b) => new Date(b.gameData.submittedAt).valueOf() - new Date(a.gameData.submittedAt).valueOf());
        activities = activities.slice(0, maxItems);

        this.approvedActivities = this.getEmptyContainer();
        const now = new Date().valueOf();
        activities.forEach((activity: any) => {
            const submittedAt = new Date(activity.gameData.submittedAt).valueOf();
            if((now - submittedAt) < 900000) { // 15min
                this.approvedActivities.recent.push(activity);
            } else if ((now - submittedAt) < 3600000) { // 1h
                this.approvedActivities.lastHour.push(activity)
            } else { // 24h
                this.approvedActivities.previously.push(activity);
            }
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


    loadMore() {
        const allActivities = this.activityService.approvedActivities.value;
        if (this.approvedActivities.recent.length
            + this.approvedActivities.lastHour.length
            + this.approvedActivities.previously.length
            >= this.total) return;
        this.maxItems += this.batchSize;
        this.loadItems(allActivities, this.maxItems);
    }

    checkScroll() {
        const threshold = 150; // px before bottom
        const position = window.innerHeight + window.scrollY;
        const height = document.body.offsetHeight;

        if (position >= height - threshold && !this.loading) {
            this.loadMore();
        }
    }
}
