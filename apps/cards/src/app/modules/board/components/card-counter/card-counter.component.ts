import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {RULES} from "../../../../app.module";
import {GameService} from "../../../../services/game.service";
import Game from "../../../../interfaces/game";

@Component({
  selector: 'app-card-counter',
  templateUrl: './card-counter.component.html',
  styleUrls: ['./card-counter.component.scss']
})
export class CardCounterComponent implements OnInit {
    public RULES = RULES;

    public gameData: Observable<Game | null> = this.gameService.gameData.asObservable()
    public indicatorData: any[] = [];

    constructor(public gameService: GameService) { }

    ngOnInit(): void {
        this.gameData.subscribe((game: Game | null) => {
            this.indicatorData = [...Array(RULES.QUEUE.CARDS_TO_SHIFT).keys()].map(index => (game?.cardUses || 0) > index)
        })
    }

}
