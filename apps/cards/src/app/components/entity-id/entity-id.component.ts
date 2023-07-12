import {Component, Input, OnInit} from '@angular/core';
import {AthleteService} from "../../services/athlete.service";

@Component({
  selector: 'app-entity-id',
  templateUrl: './entity-id.component.html',
  styleUrls: ['./entity-id.component.scss']
})
export class EntityIdComponent implements OnInit {

  @Input() id: string;

  public isAdmin$ = this.athleteService.isAdmin$;

  constructor(private athleteService: AthleteService) { }

  ngOnInit(): void {
  }

}
