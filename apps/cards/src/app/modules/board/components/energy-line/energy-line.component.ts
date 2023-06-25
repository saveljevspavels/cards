import {Component, Input, OnInit} from '@angular/core';
import {ConstService} from "../../../../services/const.service";
import {AthleteService} from "../../../../services/athlete.service";

@Component({
  selector: 'app-energy-line',
  templateUrl: './energy-line.component.html',
  styleUrls: ['./energy-line.component.scss']
})
export class EnergyLineComponent implements OnInit {
    public RULES = ConstService.RULES;
    public athlete$ = this.athleteService.me;

    public currentEnergy: number;

    constructor(public athleteService: AthleteService) { }

    ngOnInit(): void {
        this.athlete$.subscribe((athlete) => {
            this.currentEnergy = athlete?.energy || 0;
        })
    }
}


