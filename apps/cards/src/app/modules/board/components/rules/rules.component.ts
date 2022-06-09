import { Component, OnInit } from '@angular/core';
import {ConstService} from "../../../../services/const.service";

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit {
    public rules = [
        'The goal is to get the most points.',
        'Points are gained by playing cards.',
        'To play a card, you should record an activity that meets all requirements stated on a card.',
        'New activities appear in the list below.',
        'To submit an activity from the list, you need to select a card to play, add photos/comments if necessary.',
        'At any given time there are ' + ConstService.RULES.QUEUE.LENGTH + ' cards available to play, the rest are in a deck.',
        'Each time when ' + ConstService.RULES.QUEUE.CARDS_TO_SHIFT + ' cards are played, queue shifts, the last card is discarded and new card is being drawn.',
        'Some of the cards could be upgraded/changed when played set amount of times',
        'When card is being discarded, its point value is reevaluated based on how many times it was played. Card value will differ next time that card is being drawn.'
    ]

    public tiers = [
        'Easy',
        'Normal',
        'Hard',
        'Very Hard',
        'Interesting',
    ]

    constructor() { }

    ngOnInit(): void {
    }

}
