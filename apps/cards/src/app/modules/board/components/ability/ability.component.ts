import {Component, Input, OnInit} from '@angular/core';
import {Ability} from "../../../../../../../shared/interfaces/ability.interface";
import {AthleteService} from "../../../../services/athlete.service";

@Component({
  selector: 'app-ability',
  templateUrl: './ability.component.html',
  styleUrls: ['./ability.component.scss']
})
export class AbilityComponent implements OnInit {

  @Input() ability: Ability;

  public athlete$ = this.athleteService.me;

  constructor(private athleteService: AthleteService) { }

  ngOnInit(): void {
  }

}
