import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-parent',
  templateUrl: './admin-parent.component.html',
  styleUrls: ['./admin-parent.component.scss']
})
export class AdminParentComponent implements OnInit {

    public title = '';

    constructor() { }

    ngOnInit(): void {
    }

}
