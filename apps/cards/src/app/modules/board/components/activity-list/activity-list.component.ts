import { Component, OnInit } from '@angular/core';
import {ActivityService} from "../../../../services/activity.service";

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {

  public approvedActivities = this.activityService.approvedActivities;

  constructor(private activityService: ActivityService) { }

  ngOnInit(): void {
  }

}
