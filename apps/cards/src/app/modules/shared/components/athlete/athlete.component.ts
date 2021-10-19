import {Component, Input, OnInit} from '@angular/core';
import {AthleteService} from "../../../../services/athlete.service";
import {filter} from "rxjs/operators";
import Athlete from "../../../../interfaces/athlete";

@Component({
  selector: 'app-athlete',
  templateUrl: './athlete.component.html',
  styleUrls: ['./athlete.component.scss']
})
export class AthleteComponent implements OnInit {

  @Input()
  athlete: Athlete | null = null;

  @Input()
  athleteId: any = null;

  @Input()
  small: boolean = false;

  constructor(private athleteService: AthleteService) { }

  ngOnInit(): void {
    if(this.athleteId) {
      this.athleteService.athletes.pipe(filter(athletes => !!athletes.length)).subscribe(_ =>{
        this.athlete = this.athleteService.getAthlete(this.athleteId.toString())
      })
    }
  }

}
