import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-reward-bubble',
  templateUrl: './reward-bubble.component.html',
  styleUrls: ['./reward-bubble.component.scss']
})
export class RewardBubbleComponent implements OnInit {

  @Input() value: number;
  @Input() styleClass: string;
  @Input() icon: string;

  constructor() { }

  ngOnInit(): void {
  }

}
