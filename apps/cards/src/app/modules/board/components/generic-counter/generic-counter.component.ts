import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-generic-counter',
  templateUrl: './generic-counter.component.html',
  styleUrls: ['./generic-counter.component.scss']
})
export class GenericCounterComponent implements OnInit {

    @Input() filledClass: string;
    @Input() max: number;
    @Input() current: number;

    public iterator: any[];

    constructor() { }

    ngOnInit(): void {
        this.iterator = Array(this.max).fill(0);
    }

}

