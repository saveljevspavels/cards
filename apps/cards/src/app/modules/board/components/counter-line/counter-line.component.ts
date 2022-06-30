import {Component, Input, OnInit} from '@angular/core';
import {combineLatest, Observable} from "rxjs";
import {GameService} from "../../../../services/game.service";
import Game from "../../../../interfaces/game";
import {ConstService} from "../../../../services/const.service";
import {DeckService} from "../../../../services/deck.service";
import {IndicatorData} from "../generic-counter/generic-counter.component";

@Component({
  selector: 'app-counter-line',
  templateUrl: './counter-line.component.html',
  styleUrls: ['./counter-line.component.scss']
})
export class CounterLineComponent implements OnInit {
    public RULES = ConstService.RULES;

    public gameData: Observable<Game | null> = this.gameService.gameData.asObservable()
    public indicatorData: IndicatorData = {
        width: 0,
        stage: 0
    };
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
        return {
            width: Math.floor((filled / total) * 100),
            stage: Math.floor(filled / total * 5)
        }
    }

}


