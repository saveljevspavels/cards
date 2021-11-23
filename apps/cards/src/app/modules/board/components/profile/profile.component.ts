import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AthleteService} from "../../../../services/athlete.service";
import {AuthService} from "../../../../services/auth.service";
import {ActivatedRoute} from "@angular/router";
import {LocalStorageService} from "../../../../services/local-storage.service";
import {PopupService} from "../../../../services/popup.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

    public athlete: any = null;
    public athleteId: string = '';
    public self = false;

    @ViewChild('logoutPopup', { static: true }) logoutPopup: ElementRef;

    constructor(private athleteService: AthleteService,
                private authService: AuthService,
                private route: ActivatedRoute,
                private popupService: PopupService) {
    }

    ngOnInit(): void {
        this.athleteId = this.route.snapshot.params.athleteId;
        this.self = !this.athleteId || LocalStorageService.athleteId === this.athleteId;
        this.athlete = this.self ? this.athleteService.me : this.athleteService.getAthlete$(this.athleteId)
    }

    openLogoutPopup() {
        this.popupService.showPopup(this.logoutPopup);
    }

    cancelLogout() {
        this.popupService.closePopup();
    }

    logout() {
        this.authService.logout()
    }

}
