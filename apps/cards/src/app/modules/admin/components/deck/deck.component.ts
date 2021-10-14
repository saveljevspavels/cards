import { Component, OnInit } from '@angular/core';
import {AdminService} from "../../admin.service";

@Component({
  selector: 'app-deck',
  templateUrl: './deck.component.html',
  styleUrls: ['./deck.component.scss']
})
export class DeckComponent implements OnInit {

    public deck = this.adminService.deck;

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
    }

}
