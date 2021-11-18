import { Component, OnInit } from '@angular/core';
import {AthleteService} from "../../../../services/athlete.service";
import {AuthService} from "../../../../services/auth.service";
import {ActivatedRoute} from "@angular/router";
import {LocalStorageService} from "../../../../services/local-storage.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

    public athlete: any = null;
    public athleteId: string = '';
    public self = false;

    constructor(private athleteService: AthleteService,
                private authService: AuthService,
                private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.athleteId = this.route.snapshot.params.athleteId;
        this.self = !this.athleteId || LocalStorageService.athleteId === this.athleteId;
        this.athlete = this.self ? this.athleteService.me : this.athleteService.getAthlete$(this.athleteId)
    }

    logout() {
        this.authService.logout()
    }

}
