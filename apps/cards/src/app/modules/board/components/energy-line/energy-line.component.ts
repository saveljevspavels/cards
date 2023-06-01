import {Component, Input, OnInit} from '@angular/core';
import {ConstService} from "../../../../services/const.service";
import {IndicatorData} from "../generic-counter/generic-counter.component";
import {AthleteService} from "../../../../services/athlete.service";

@Component({
  selector: 'app-energy-line',
  templateUrl: './energy-line.component.html',
  styleUrls: ['./energy-line.component.scss']
})
export class EnergyLineComponent implements OnInit {
    public RULES = ConstService.RULES;
    public athlete$ = this.athleteService.me;

    public indicatorData: IndicatorData = {
        width: 0,
        stage: 0
    };

    constructor(public athleteService: AthleteService) { }

    ngOnInit(): void {
        this.athlete$.subscribe((athlete) => {
            this.indicatorData = this.generateIndicatorData(athlete?.energy || 0)
        })
    }

    generateIndicatorData(energy: number) {
        return {
            width: Math.floor((energy / this.RULES.ENERGY.MAX) * 100),
            stage: Math.floor(energy / this.RULES.ENERGY.MAX * 5)
        }
    }

}


