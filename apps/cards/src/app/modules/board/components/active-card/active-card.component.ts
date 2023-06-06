import {Component, Input, OnInit} from '@angular/core';
import {ActiveCard} from "../../../../../../../shared/interfaces/active-card";

@Component({
  selector: 'app-active-card',
  templateUrl: './active-card.component.html',
  styleUrls: ['./active-card.component.scss']
})
export class ActiveCardComponent implements OnInit {

  @Input()
  public card: ActiveCard;

  constructor() { }

  ngOnInit(): void {
  }

}
