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
        'Some of the cards could be upgraded/changed when played set amount of times',
        'When card is being discarded, its point value is reevaluated based on how many times it was played. Card value will differ next time that card is being drawn.'
    ]

    public tiers = [
        'Easy',
        'Normal',
        'Hard',
        'Very Hard',
        'Help me Jesus',
    ]

    constructor() { }

    ngOnInit(): void {
    }

}
