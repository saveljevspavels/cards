import {Component, Input, OnInit} from '@angular/core';
import {ConstService} from "../../../../services/const.service";
import {IndicatorData} from "../generic-counter/generic-counter.component";
import {AthleteService} from "../../../../services/athlete.service";

@Component({
  selector: 'app-coins-display',
  templateUrl: './coins-display.component.html',
  styleUrls: ['./coins-display.component.scss']
})
export class CoinsDisplayComponent implements OnInit {
    public RULES = ConstService.RULES;
    public athlete$ = this.athleteService.me;

    public indicatorData: IndicatorData = {
        width: 0,
        stage: 0
    };

    constructor(public athleteService: AthleteService) { }

    ngOnInit(): void {
        this.athlete$.subscribe((athlete) => {
            this.indicatorData = this.generateIndicatorData(athlete?.coins || 0)
        })
    }

    generateIndicatorData(coins: number) {
        return {
            width: coins,
            stage: Math.floor(coins / 20)
        }
    }

}


