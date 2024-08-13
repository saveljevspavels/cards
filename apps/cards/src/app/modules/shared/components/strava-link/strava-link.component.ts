import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-strava-link',
  templateUrl: './strava-link.component.html',
  styleUrls: ['./strava-link.component.scss']
})
export class StravaLinkComponent implements OnInit {

  @Input() activityId: string;
  @Input() athleteId: string;
  @Input() padded: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
