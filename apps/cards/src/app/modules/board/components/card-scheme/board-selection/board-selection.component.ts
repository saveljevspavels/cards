import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CardSchemeBoard} from "../../../../../../../../shared/interfaces/card-scheme.interface";

@Component({
  selector: 'app-board-selection',
  templateUrl: './board-selection.component.html',
  styleUrls: ['./board-selection.component.scss']
})
export class BoardSelectionComponent implements OnInit {

  @Input() boards: CardSchemeBoard[];
  @Input() activeBoard: string;
  @Input() unlockMap: Map<string, number> = new Map();

  @Output() boardSelected = new EventEmitter;

  constructor() { }

  ngOnInit(): void {
  }

  select(boardKey: string) {
    this.boardSelected.emit(boardKey)
  }

}
