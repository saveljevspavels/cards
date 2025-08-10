import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CardSnapshot } from '../../../../../../../shared/classes/card.class';
import { Activity } from '../../../../../../../shared/interfaces/activity.interface';
import { FormControl } from '@angular/forms';
import { ActivityService } from '../../../../services/activity.service';
import { AthleteService } from '../../../../services/athlete.service';

@Component({
    selector: 'app-comment-view',
    templateUrl: './comment-view.component.html',
    styleUrl: './comment-view.component.scss',
})
export class CommentViewComponent implements OnInit, OnDestroy {
    @Input({required: true}) card: CardSnapshot;
    @Input({required: true}) activity: Activity;

    @Output() closeComments = new EventEmitter;

    public activityComment = new FormControl('');

    public me = this.athleteService.me;

    constructor(private activityService: ActivityService,
                private athleteService: AthleteService) {
    }

    ngOnInit() {
        window.addEventListener('popstate', this.popStateHandler);
        history.pushState({ overlay: true }, '', location.href);
    }

    addComment() {
        if (this.activityComment.value && this.card) {
            this.activityService.commentActivity(this.activity.id.toString(), this.card.id, this.activityComment.value).subscribe(() => {
                console.log(`Comment added to card ${this.card.id}`);
                this.card.comments?.push({
                    id: '',
                    content: this.activityComment.value || '',
                    authorId: this.me.value?.id || '',
                    authorName: this.me.value?.name || '',
                    timestamp: new Date().toISOString(),
                });
                this.activityComment.setValue('');
            });
        }
    }

    deleteComment(cardSnapshot: CardSnapshot, commentId: string) {
        this.activityService.deleteActivityComment(this.activity.id.toString(), cardSnapshot.id, commentId).subscribe(() => {
            console.log(`Comment ${commentId} deleted from card ${cardSnapshot.id}`);
        });
    }

    close() {
        console.log(`emit closeComments`);
        this.closeComments.emit();
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // prevent newline
            this.addComment();
        }
    }

    private popStateHandler = (event: PopStateEvent) => {
        event.preventDefault();
        this.close();
    };
    ngOnDestroy() {
        window.removeEventListener('popstate', this.popStateHandler);
    }
}
