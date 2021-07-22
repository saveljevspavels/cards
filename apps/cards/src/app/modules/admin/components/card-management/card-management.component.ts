import { Component, OnInit } from '@angular/core';
import {AdminService} from "../../admin.service";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-card-management',
  templateUrl: './card-management.component.html',
  styleUrls: ['./card-management.component.scss']
})
export class CardManagementComponent implements OnInit {

    public cardFactories = this.adminService.cardFactories;
    public cardFactoryToEdit: any;
    public selectedCardFactories = new FormControl([]);

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
    }

    cardFactorySelected(cardFactory: any) {
        this.cardFactoryToEdit = cardFactory;
    }

}
