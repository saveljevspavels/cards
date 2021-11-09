import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'app-counter-item',
    templateUrl: './counter-item.component.html',
    styleUrls: ['./counter-item.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CounterItemComponent implements OnInit {

    @Input() checked = false;

    constructor() { }

    ngOnInit(): void {
    }

}
