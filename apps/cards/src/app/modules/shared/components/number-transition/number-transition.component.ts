import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-number-transition',
  templateUrl: './number-transition.component.html',
  styleUrls: ['./number-transition.component.scss']
})
export class NumberTransitionComponent implements OnChanges {

  @Input() value: number;
  @Input() pipeType: string;
  public displayValue: number;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.value.isFirstChange()) {
      this.displayValue = changes.value.currentValue;
    } else {
      const delta = changes.value.currentValue - changes.value.previousValue;
      const interval = setInterval(() => {
        if(this.displayValue < this.value) {
          this.displayValue++;
        } else if(this.displayValue > this.value) {
          this.displayValue--;
        } else {
          clearInterval(interval);
        }
      }, Math.ceil(Math.abs(300 / delta)));

    }
  }

}

