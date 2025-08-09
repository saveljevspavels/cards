import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardComment } from '../../../../../../../shared/classes/card.class';
import { AthleteService } from '../../../../services/athlete.service';

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.scss'],
})
export class CommentComponent {
    @Input() comment: CardComment;
    @Input() text: string;
    @Input() authorId: string;
    @Input() timestamp: string;

    @Output() deleteComment = new EventEmitter();

    public isAdmin$ = this.athleteService.isAdmin$;

    constructor(private athleteService: AthleteService) {}

    public delete() {
        this.deleteComment.emit(this.comment.id);
    }
}
