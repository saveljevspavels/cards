import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-board-parent',
  templateUrl: './board-parent.component.html',
  styleUrls: ['./board-parent.component.scss']
})
export class BoardParentComponent implements OnInit {

    public title = '';

    constructor() { }

    ngOnInit(): void {
    }

}
