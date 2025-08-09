import {Component, Input} from '@angular/core';
import { CardComment } from '../../../../../../../shared/classes/card.class';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent {

  @Input() comment: CardComment;
  @Input() text: string;
  @Input() authorId: string;

}
