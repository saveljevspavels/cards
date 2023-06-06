import { Component, OnInit } from '@angular/core';
import {CardService} from "../../../../services/card.service";
import {AthleteService} from "../../../../services/athlete.service";
import {Observable} from "rxjs";
import Athlete from "../../../../../../../shared/interfaces/athlete.interface";

@Component({
  selector: 'app-active-card-list',
  templateUrl: './active-card-list.component.html',
  styleUrls: ['./active-card-list.component.scss']
})
export class ActiveCardListComponent implements OnInit {

  public athlete: Observable<Athlete | null> = this.athleteService.me;
  
  constructor(
      private cardService: CardService,
      private athleteService: AthleteService
  ) { }

  ngOnInit(): void {
    
  }

}
