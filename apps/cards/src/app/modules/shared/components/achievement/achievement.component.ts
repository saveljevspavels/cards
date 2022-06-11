import {Component, Input, OnInit} from '@angular/core';
import {Achievement} from "../../../../interfaces/achievement";

@Component({
  selector: 'app-achievement',
  templateUrl: './achievement.component.html',
  styleUrls: ['./achievement.component.scss']
})
export class AchievementComponent implements OnInit {

    @Input() achievement: Achievement;

    constructor() { }

    ngOnInit(): void {
    }

}
