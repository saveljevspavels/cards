import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-card-board',
  templateUrl: './card-board.component.html',
  styleUrls: ['./card-board.component.scss']
})
export class CardBoardComponent implements OnInit {

  public filterData: any;

  constructor() { }

  ngOnInit(): void {
  }

  setFilterData(data: any) {
    this.filterData = data;
  }

}
