import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AthleteService} from "../../../../services/athlete.service";
import {AuthService} from "../../../../services/auth.service";
import {ActivatedRoute} from "@angular/router";
import {PopupService} from "../../../../services/popup.service";
import {AchievementService} from "../../../../services/achievement.service";
import {Achievement} from "../../../../interfaces/achievement";
import {Observable} from "rxjs";
import {ActivityService} from "../../../../services/activity.service";
import {map} from "rxjs/operators";
import Athlete from "../../../../../../../shared/classes/athlete.class";
import {ConstService} from "../../../../services/const.service";
import {CONST} from "../../../../../../../../definitions/constants";
import {ABILITIES} from "../../../../../../../../definitions/abilities";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    public ABILITIES = ABILITIES;

    public athlete$: Observable<Athlete | null>;
    public athlete: Athlete | null;
    public athleteId: string = '';
    public self = false;

    public athleteActivities$: Observable<any>;

    public achievements$: Observable<(Achievement | null)[]>;

    @ViewChild('logoutPopup', { static: true }) logoutPopup: ElementRef;

    constructor(private athleteService: AthleteService,
                private authService: AuthService,
                private activityService: ActivityService,
                private achievementsService: AchievementService,
                private route: ActivatedRoute,
                private popupService: PopupService) {
    }

    ngOnInit(): void {
        this.athleteId = this.route.snapshot.params.athleteId;
        this.self = !this.athleteId || this.athleteService.myId.value === this.athleteId;
        this.athlete$ = this.self ? this.athleteService.me : this.athleteService.getAthlete$(this.athleteId)
        this.athlete$.subscribe((athlete) => {
            this.athlete = athlete;
            this.athleteActivities$ = this.activityService.approvedActivities.pipe(map((activities => activities.filter((activity: any) => activity.athlete.id.toString() === athlete?.id).reverse())))
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
