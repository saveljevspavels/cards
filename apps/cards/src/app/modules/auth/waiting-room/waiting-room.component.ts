import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
    constructor() {}

    ngOnInit(): void {
        document.body.classList.add('nomargin');
    }

    ngOnDestroy() {
        document.body.classList.remove('nomargin');
    }
}


