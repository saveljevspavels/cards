import { Component, OnInit } from '@angular/core';
import {AthleteService} from "../../../../services/athlete.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

    public athlete: any = null;

    constructor(private athleteService: AthleteService) { }

    ngOnInit(): void {
        this.athlete = this.athleteService.me
    }

}
