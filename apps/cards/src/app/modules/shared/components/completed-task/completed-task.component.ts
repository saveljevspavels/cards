import {Component, Input, OnInit} from '@angular/core';
import {filter} from "rxjs/operators";
import {CardService} from "../../../../services/card.service";
import { Card } from "../../../../../../../shared/classes/card.class";

@Component({
  selector: 'app-completed-task',
  templateUrl: './completed-task.component.html',
  styleUrls: ['./completed-task.component.scss']
})
export class CompletedTaskComponent implements OnInit {

  @Input() cardId: string;
  @Input() perks: {[key: string]: number} = {};
  public card: Card;
  public imageName = '';
  constructor(
      private cardService: CardService
  ) { }

  ngOnInit(): void {
    if(this.cardId) {
      this.cardService.cards.pipe(filter(cards => !!cards.length)).subscribe(async _ =>{
        this.card = this.cardService.getCard(this.cardId)
        this.imageName = this.card.title
            .toLowerCase()
            .replace(/[.,!?\-'()]/g, '')
            .replace(/\s+/g, '_');
      })
    }
  }

  claimReward() {
    this.cardService.claimCardReward(this.cardId).subscribe(() => {})
  }

}
