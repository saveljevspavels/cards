import { Component, OnInit } from '@angular/core';
import {AthleteService} from "../../../../services/athlete.service";
import {AuthService} from "../../../../services/auth.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

    public athlete: any = null;

    constructor(private athleteService: AthleteService,
                private authService: AuthService) { }

    ngOnInit(): void {
        this.athlete = this.athleteService.me
    }

    logout() {
        this.authService.logout()
    }

}
