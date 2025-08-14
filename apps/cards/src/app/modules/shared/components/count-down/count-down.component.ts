import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {Subscription, interval, timer} from 'rxjs';
import {RULES} from "../../../../../../../../definitions/rules";
import {GameService} from "../../../../services/game.service";
import {DateService} from "../../../../../../../shared/utils/date.service";

@Component({
  selector: 'app-count-down',
  templateUrl: './count-down.component.html',
  styleUrls: ['./count-down.component.scss']
})
export class CountDownComponent implements OnInit, OnDestroy {

  @Input() label = 'Time left:';
  @Input() targetHours = [];
  @Input() noTemplate = false;

  private subscription: Subscription;

  public targetTime: Date;

  public timeDifference: number;

  public gameData = this.gameService.gameData;

  private getTimeDifference (): number {
     return Math.max((this.targetTime.getTime() - new  Date().getTime()) / 1000, 0);
  }

  constructor(private gameService: GameService) {
  }

  ngOnInit() {
    this.gameService.gameData.subscribe(gameData => {
      this.setTargetTime(gameData?.startDate || '');
      this.subscription = timer(0, 1000).subscribe(x => {
        this.timeDifference = this.getTimeDifference();
        if(this.timeDifference === 0) {
          this.setTargetTime(gameData?.startDate || '');
        }
      });
    })
  }

  setTargetTime(startDate = '') {
    this.targetTime = new Date();
    this.targetTime.setSeconds(0)
    this.targetTime.setMinutes(0)
    this.targetTime.setHours(this.targetHours.find(hour => hour > this.targetTime.getHours()) || this.targetHours[0] + 24)
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}
