import {Component, Input, OnInit} from '@angular/core';
import {RULES} from "../../../../app.module";

@Component({
    selector: 'app-division-info',
    templateUrl: './division-info.component.html',
    styleUrls: ['./division-info.component.scss']
})
export class DivisionInfoComponent implements OnInit {

    rules = RULES;

    @Input()
    public division: any;

    constructor() { }

    ngOnInit(): void {
    }

}
