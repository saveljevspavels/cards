import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-svg',
    templateUrl: './svg.component.html',
    styleUrls: ['./svg.component.scss']
})
export class SvgComponent implements OnInit {

    @Input() icon: string;
    @Input() width = 24;
    @Input() height = 24;
    @Input() viewBox = "0 0 24 24";

    constructor() { }

    ngOnInit(): void {
    }

}