import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-generic-counter',
  templateUrl: './generic-counter.component.html',
  styleUrls: ['./generic-counter.component.scss']
})
export class GenericCounterComponent implements OnInit {

    @Input() public indicatorData: IndicatorData
    @Input() energyColors = false;

    constructor() { }

    ngOnInit(): void {
    }

}

export interface IndicatorData {
    width: number;
    stage: number;
}
