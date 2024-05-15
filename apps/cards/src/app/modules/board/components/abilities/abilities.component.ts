import { Component, OnInit } from '@angular/core';
import {Ability, AbilityKey} from "../../../../../../../shared/interfaces/ability.interface";
import {ABILITIES} from "../../../../../../../../definitions/abilities";
import {AthleteService} from "../../../../services/athlete.service";
import Athlete from "../../../../../../../shared/classes/athlete.class";
import {RULES} from "../../../../../../../../definitions/rules";

@Component({
  selector: 'app-abilities',
  templateUrl: './abilities.component.html',
  styleUrls: ['./abilities.component.scss']
})
export class AbilitiesComponent implements OnInit {

  public abilities: Ability[];
  public athlete: Athlete;

  constructor(private athleteService: AthleteService) { }

  ngOnInit(): void {
    this.athleteService.me.subscribe(athlete => {
      if(athlete) {
        this.athlete = athlete;
        this.abilities = ABILITIES
            .filter((ability: Ability) => RULES.ENABLED_ABILITIES.indexOf(ability.key) !== -1)
            .filter((ability: Ability) => athlete.usedAbilities.indexOf(ability.key) === -1);
      }
    })
  }

}