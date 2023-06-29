import { Component, OnInit } from '@angular/core';
import {CONST} from "../../../../../../../../definitions/constants";
import {ActivityService} from "../../../../services/activity.service";

@Component({
  selector: 'app-game-stats',
  templateUrl: './game-stats.component.html',
  styleUrls: ['./game-stats.component.scss']
})
export class GameStatsComponent implements OnInit {

  public stats: any = {
    activityAmount: 0,
    totalTime: 0,
    totalDistance: 0,
    run: {
      activityAmount: 0,
      totalTime: 0,
      totalDistance: 0,
    },
    ride: {
      activityAmount: 0,
      totalTime: 0,
      totalDistance: 0,
    },
    walk: {
      activityAmount: 0,
      totalTime: 0,
      totalDistance: 0,
    },
    other: {
      activityAmount: 0,
      totalTime: 0,
      totalDistance: 0,
    }
  };

  constructor(private activityService: ActivityService) { }

  ngOnInit(): void {
    this.activityService.approvedActivities.subscribe(activities => {
      console.log('activities', activities)
      this.stats.activityAmount = activities.length;
      this.stats.totalTime = activities.reduce((acc: any, i: any) => {
        acc = Math.floor(acc + i.elapsed_time);
        return acc;
      }, 0);
      this.stats.totalDistance = activities.reduce((acc: any, i: any) => {
        acc = Math.floor(acc + i.distance);
        return acc;
      }, 0);
      activities.forEach((activity: any) => {
        const type = Object.values(CONST.ACTIVITY_TYPES).find((activityType) => activity.type.toUpperCase().indexOf(activityType.toUpperCase()) !== -1) || CONST.ACTIVITY_TYPES.OTHER;
        this.stats[type].activityAmount = this.stats[type].activityAmount + 1;
        this.stats[type].totalDistance = this.stats[type].totalDistance + activity.distance;
        this.stats[type].totalTime = this.stats[type].totalTime + activity.elapsed_time;
      })
      console.log('stats', this.stats)

    })
  }

}
