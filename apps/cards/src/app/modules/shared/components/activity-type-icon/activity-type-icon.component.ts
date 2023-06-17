import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-activity-type-icon',
  templateUrl: './activity-type-icon.component.html',
  styleUrls: ['./activity-type-icon.component.scss']
})
export class ActivityTypeIconComponent implements OnInit {

  @Input() type: string;

  constructor() { }

  ngOnInit(): void {
  }

}
