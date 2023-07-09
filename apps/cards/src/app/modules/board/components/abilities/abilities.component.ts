import { Component, OnInit } from '@angular/core';
import {RULES} from "../../../../../../../../definitions/rules";
import {Ability} from "../../../../../../../shared/interfaces/ability.interface";

@Component({
  selector: 'app-abilities',
  templateUrl: './abilities.component.html',
  styleUrls: ['./abilities.component.scss']
})
export class AbilitiesComponent implements OnInit {

  public abilities: Ability[] = RULES.ABILITIES;

  constructor() { }

  ngOnInit(): void {
  }

}