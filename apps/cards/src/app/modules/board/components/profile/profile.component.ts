import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AthleteService} from "../../../../services/athlete.service";
import {AuthService} from "../../../../services/auth.service";
import {ActivatedRoute} from "@angular/router";
import {LocalStorageService} from "../../../../services/local-storage.service";
import {PopupService} from "../../../../services/popup.service";
import {AchievementService} from "../../../../services/achievement.service";
import {Achievement} from "../../../../interfaces/achievement";
import {Observable} from "rxjs";
import Athlete from "../../../../interfaces/athlete";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

    public athlete$: Observable<Athlete | null>;
    public athlete: Athlete | null;
    public athleteId: string = '';
    public self = false;

    public achievements$: Observable<(Achievement | null)[]>;

    @ViewChild('logoutPopup', { static: true }) logoutPopup: ElementRef;

    constructor(private athleteService: AthleteService,
                private authService: AuthService,
                private achievementsService: AchievementService,
                private route: ActivatedRoute,
                private popupService: PopupService) {
    }

    ngOnInit(): void {
        this.athleteId = this.route.snapshot.params.athleteId;
        this.self = !this.athleteId || LocalStorageService.athleteId === this.athleteId;
        this.athlete$ = this.self ? this.athleteService.me : this.athleteService.getAthlete$(this.athleteId)
        this.athlete$.subscribe((athlete) => {
            this.athlete = athlete;
            this.achievements$ = this.achievementsService.getAchievements(athlete?.achievements || []);
        })
    }

    openLogoutPopup() {
        this.popupService.showPopup(this.logoutPopup);
    }

    cancelLogout() {
        this.popupService.closePopup();
    }

    logout() {
        this.authService.logout()
        this.popupService.closePopup();
    }

}
