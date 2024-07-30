import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-reward-chest',
  templateUrl: './reward-chest.component.html',
  styleUrls: ['./reward-chest.component.scss']
})
export class RewardChestComponent implements OnInit {

  @Input() value: number;

  constructor() { }

  ngOnInit(): void {
  }

}
