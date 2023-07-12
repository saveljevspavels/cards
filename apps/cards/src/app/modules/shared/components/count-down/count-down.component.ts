import { Component, OnInit, OnDestroy } from '@angular/core';
import {Subscription, interval, timer} from 'rxjs';
import {RULES} from "../../../../../../../../definitions/rules";

@Component({
  selector: 'app-count-down',
  templateUrl: './count-down.component.html',
  styleUrls: ['./count-down.component.scss']
})
export class CountDownComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  public targetTime: Date;

  public timeDifference: number;

  private getTimeDifference (): number {
     return Math.max((this.targetTime.getTime() - new  Date().getTime()) / 1000, 0);
  }

  ngOnInit() {
    this.setTargetTime();
    this.subscription = timer(0, 1000).subscribe(x => {
      this.timeDifference = this.getTimeDifference();
      if(this.timeDifference === 0) {
        this.setTargetTime();
      }
    });
  }

  setTargetTime() {
    this.targetTime = new Date();
    this.targetTime.setSeconds(0)
    this.targetTime.setMinutes(0)
    this.targetTime.setHours(RULES.FEATURED_TASK_HOURS.find(hour => hour > this.targetTime.getHours()) || RULES.FEATURED_TASK_HOURS[0] + 24)
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}