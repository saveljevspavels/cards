import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-reward-experience',
  templateUrl: './reward-experience.component.html',
  styleUrls: ['./reward-experience.component.scss']
})
export class RewardExperienceComponent implements OnInit {

  @Input() value: number

  constructor() { }

  ngOnInit(): void {
  }

}
