import {Component, ElementRef, HostListener, OnInit, ViewEncapsulation} from '@angular/core';
import {PopupService} from "../../../../services/popup.service";

@Component({
    selector: 'app-popup',
    templateUrl: './popup.component.html',
    styleUrls: ['./popup.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PopupComponent implements OnInit {

    public template = this.popupService.popup$;

    constructor(private popupService: PopupService,
                private eRef: ElementRef) { }

    ngOnInit(): void {
    }

    public closePopup() {
        this.popupService.popup = null;
    }

}
