import {Component, Input, OnInit} from '@angular/core';
import {ConstService} from "../../../../../services/const.service";
import {AthleteService} from "../../../../../services/athlete.service";

@Component({
  selector: 'app-energy-display',
  templateUrl: './energy-display.component.html',
  styleUrls: ['./energy-display.component.scss']
})
export class EnergyDisplayComponent implements OnInit {
    public RULES = ConstService.RULES;
    public athlete$ = this.athleteService.me;

    public currentEnergy: number;

    constructor(public athleteService: AthleteService) { }

    ngOnInit(): void {
        this.athlete$.subscribe((athlete) => {
            this.currentEnergy = athlete?.currencies.energy || 0;
        })
    }
}


