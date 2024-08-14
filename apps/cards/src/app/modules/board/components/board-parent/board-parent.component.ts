import { Component, OnInit } from '@angular/core';
import {FormControl} from "@angular/forms";
import {ChallengeService} from "../../../../services/challenge.service";
import {PopupService} from "../../../../services/popup.service";

@Component({
  selector: 'app-board-parent',
  templateUrl: './board-parent.component.html',
  styleUrls: ['./board-parent.component.scss']
})
export class BoardParentComponent implements OnInit {

    public title = '';

    public challengeUpdates: any = {};

    public progressPopupControl = new FormControl();

    constructor(
        private challengeService: ChallengeService,
        private popupService: PopupService,
    ) { }

    ngOnInit(): void {
        this.challengeService.challengeUpdates$.subscribe((updates) => {
            this.challengeUpdates = updates;
            setTimeout(() => {
                this.popupService.showPopup(this.progressPopupControl.value);
            });
        });
    }
}
