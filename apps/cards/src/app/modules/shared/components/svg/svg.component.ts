import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-svg',
    templateUrl: './svg.component.html',
    styleUrls: ['./svg.component.scss']
})
export class SvgComponent implements OnInit {

    @Input() icon: string;
    @Input() width: number;
    @Input() height: number;
    @Input() viewBox = "0 0 24 24";
    @Input() styleClass = "";

    constructor() { }

    ngOnInit(): void {
        this.height = this.height || 24;
        this.width = this.width || 24;
    }

}
