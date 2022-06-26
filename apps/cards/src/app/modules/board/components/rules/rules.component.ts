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
        'Points are gained by playing cards and getting achievements.',
        'To play a card, you should record an activity that meets all requirements stated on a card.',
        'New activities are automatically synchronized with Strava and appear in the "Your Pending Activities" list.',
        'To submit an activity from the list, you need to click on activity, then select a card to play, add photos/comments if necessary.',
        'Some cards require manual validation, so it might take some time for approval',
        'Achievements are not automated, so please ask for those in a comment or through a chat',
        'Card values may change over time, more played card values are decreased, less played card values are increased. This happens when "Cards played" counter is filled',
        'New, stronger cards are added when counter below the card is filled',
        'Please try to play a card with activity at the same day you did that activity',
        'Small/garbage activities can be deleted by clicking on it and scrolling all the way down to "Delete Activity" button',
        'Each athlete has his/her own run/bike distance requirements for cards for it to be competitive for everyone (this values could be negotiated)',
    ]

    public tiers = [
        `Easy (${ConstService.RULES.LEVELS["0"].min}-${ConstService.RULES.LEVELS["0"].max} points)`,
        `Normal (${ConstService.RULES.LEVELS["1"].min}-${ConstService.RULES.LEVELS["1"].max} points)`,
        `Hard (${ConstService.RULES.LEVELS["2"].min}-${ConstService.RULES.LEVELS["2"].max} points)`,
        `Very Hard (${ConstService.RULES.LEVELS["3"].min}-${ConstService.RULES.LEVELS["3"].max} points)`,
        `Help me Jesus (${ConstService.RULES.LEVELS["4"].min}+ points)`,
    ]

    constructor() { }

    ngOnInit(): void {
    }

}
