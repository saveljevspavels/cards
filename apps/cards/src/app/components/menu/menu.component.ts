import {Component, Input, OnInit} from '@angular/core';
import {MenuRouteItem} from "../../interfaces/menu-route-item";

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

    @Input() routes: MenuRouteItem[]

    constructor() {
    }

    ngOnInit(): void {
    }
}

