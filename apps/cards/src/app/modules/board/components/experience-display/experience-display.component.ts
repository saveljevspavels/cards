import {Component, Input, OnInit} from '@angular/core';
import {ConstService} from "../../../../services/const.service";
import {AthleteService} from "../../../../services/athlete.service";

@Component({
  selector: 'app-experience-display',
  templateUrl: './experience-display.component.html',
  styleUrls: ['./experience-display.component.scss']
})
export class ExperienceDisplayComponent implements OnInit {
    public RULES = ConstService.RULES;
    public athlete$ = this.athleteService.me;

    constructor(public athleteService: AthleteService) { }

    ngOnInit(): void {

    }
}


