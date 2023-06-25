import {Component, Input, OnInit} from '@angular/core';
import {ConstService} from "../../../../services/const.service";
import {AthleteService} from "../../../../services/athlete.service";

@Component({
  selector: 'app-coins-display',
  templateUrl: './coins-display.component.html',
  styleUrls: ['./coins-display.component.scss']
})
export class CoinsDisplayComponent implements OnInit {
    public RULES = ConstService.RULES;
    public athlete$ = this.athleteService.me;

    constructor(public athleteService: AthleteService) { }

    ngOnInit(): void {

    }
}


