import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-reward-special-task',
  templateUrl: './reward-special-task.component.html',
  styleUrls: ['./reward-special-task.component.scss']
})
export class RewardSpecialTaskComponent implements OnInit {

  @Input() value: number;

  constructor() { }

  ngOnInit(): void {
  }

}
