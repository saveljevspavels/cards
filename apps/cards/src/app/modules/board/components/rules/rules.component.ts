import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {GameService} from "../../../../services/game.service";
import {RULES} from "../../../../app.module";

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit {
    public RULES = RULES;

    public cardUses: Observable<number> = this.gameService.cardUses.asObservable()

    public rules = {
        left: [
            'The goal is to get the most points.',
            'Points are gained by playing cards.',
            'To play a card, you should record an activity that meets all requirements stated on a card.',
            'New activities appear in the list below.',
            'To submit an activity from the list, then select a card to play, add photos/comments if necessary.'
        ],
        right: [
            'On any given time there are ' + RULES.QUEUE.LENGTH + ' cards available to play, the rest are in a deck.',
            'Each time when ' + RULES.QUEUE.CARDS_TO_SHIFT + ' cards are played, queue shifts, last card is discarded and new card is being drawn.',
            'Some of the cards could be upgraded/changed when played set amount of times',
            'When card is being discarded, its point value is reevaluated based on how many times it was played. Card value will differ next time that card is being drawn.'
        ]
    }

    constructor(public gameService: GameService) { }

    ngOnInit(): void {
    }

}