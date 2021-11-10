import { Component, OnInit } from '@angular/core';
import {PopupService} from "../../../../services/popup.service";

@Component({
    selector: 'app-popup',
    templateUrl: './popup.component.html',
    styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

    public template = this.popupService.popup$;

    constructor(private popupService: PopupService) { }

    ngOnInit(): void {
    }

}
