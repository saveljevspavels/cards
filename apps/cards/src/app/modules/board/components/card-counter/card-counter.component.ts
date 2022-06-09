import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {GameService} from "../../../../services/game.service";
import Game from "../../../../interfaces/game";
import {ConstService} from "../../../../services/const.service";

@Component({
  selector: 'app-card-counter',
  templateUrl: './card-counter.component.html',
  styleUrls: ['./card-counter.component.scss']
})
export class CardCounterComponent implements OnInit {
    public RULES = ConstService.RULES;

    public gameData: Observable<Game | null> = this.gameService.gameData.asObservable()
    public indicatorData: any[] = [];

    constructor(public gameService: GameService) { }

    ngOnInit(): void {
        this.gameData.subscribe((game: Game | null) => {
            this.indicatorData = [...Array(ConstService.RULES.QUEUE.CARDS_TO_SHIFT).keys()].map(index => (game?.cardUses || 0) > index)
        })
    }

}
