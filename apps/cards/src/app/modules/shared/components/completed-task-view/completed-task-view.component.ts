import { Component, OnInit } from '@angular/core';
import {AthleteService} from "../../../../services/athlete.service";
import {Observable} from "rxjs";
import Athlete from "../../../../../../../shared/interfaces/athlete.interface";

@Component({
  selector: 'app-completed-task-view',
  templateUrl: './completed-task-view.component.html',
  styleUrls: ['./completed-task-view.component.scss']
})
export class CompletedTaskViewComponent implements OnInit {

  public athlete: Observable<Athlete | null> = this.athleteService.me;

  constructor(private athleteService: AthleteService) { }

  ngOnInit(): void {
  }

}
