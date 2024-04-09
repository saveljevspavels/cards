import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-strava-connect-button',
  templateUrl: './strava-connect-button.component.html',
  styleUrls: ['./strava-connect-button.component.scss']
})
export class StravaConnectButtonComponent implements OnInit {

  @Input() styleClass = '';

  constructor() { }

  ngOnInit(): void {
  }

}
