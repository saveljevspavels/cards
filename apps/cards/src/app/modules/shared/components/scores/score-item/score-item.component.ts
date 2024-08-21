import {Component, Input, OnInit} from '@angular/core';
import Athlete from "../../../../../../../../shared/classes/athlete.class";
import {AthleteService} from "../../../../../services/athlete.service";

@Component({
    selector: 'app-score-item',
    templateUrl: './score-item.component.html',
    styleUrls: ['./score-item.component.scss']
})
export class ScoreItemComponent implements OnInit {

    @Input() score: any;
    @Input() position: number;

    public athletes: Athlete[] = this.athleteService.athletes.value;

    constructor(private athleteService: AthleteService) { }

    ngOnInit(): void {
    }

}
