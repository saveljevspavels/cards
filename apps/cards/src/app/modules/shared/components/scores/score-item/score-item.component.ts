import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-score-item',
    templateUrl: './score-item.component.html',
    styleUrls: ['./score-item.component.scss']
})
export class ScoreItemComponent implements OnInit {

    @Input() score: any;
    @Input() position: number;

    constructor() { }

    ngOnInit(): void {
    }

}
