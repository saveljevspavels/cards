import {
    Component, ElementRef, ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { PopupService } from '../../../../services/popup.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
    selector: 'app-logout-button',
    templateUrl: './logout-button.component.html',
    styleUrls: ['./logout-button.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LogoutButtonComponent {

    @ViewChild('logoutPopup', { static: true }) logoutPopup: ElementRef;
    constructor(private popupService: PopupService,
                private authService: AuthService) {
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
