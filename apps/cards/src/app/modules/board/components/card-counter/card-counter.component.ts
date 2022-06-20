import { Component, OnInit } from '@angular/core';
import {combineLatest, Observable} from "rxjs";
import {GameService} from "../../../../services/game.service";
import Game from "../../../../interfaces/game";
import {ConstService} from "../../../../services/const.service";
import {DeckService} from "../../../../services/deck.service";

@Component({
  selector: 'app-card-counter',
  templateUrl: './card-counter.component.html',
  styleUrls: ['./card-counter.component.scss']
})
export class CardCounterComponent implements OnInit {
    public RULES = ConstService.RULES;

    public gameData: Observable<Game | null> = this.gameService.gameData.asObservable()
    public indicatorData: any[] = [];
    public deckLength = 0;

    constructor(public gameService: GameService,
                public deckService: DeckService) { }

    ngOnInit(): void {
        combineLatest([
            this.gameData,
            this.deckService.cardQueue
        ]).subscribe(([gameData, deck]) => {
            this.indicatorData = this.generateIndicatorData(deck.length, gameData?.cardUses || 0)
        })
    }

    generateIndicatorData(total: number, filled: number) {
        return [...Array(total).keys()].map(index => (filled || 0) > index)
    }

}
