import { Component, OnInit } from '@angular/core';
import {AVAILABLE_ITEMS, STORE_ITEMS} from "../../../../../../../../definitions/storeItems";
import {StoreService} from "../../../../services/store.service";
import {StoreHelperService} from "../../../../../../../shared/services/store.helper.service";
import {RULES} from "../../../../../../../../definitions/rules";
import {FormControl} from "@angular/forms";
import {StoreItem} from "../../../../../../../shared/interfaces/store-item.interface";
import {PopupService} from "../../../../services/popup.service";

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})
export class StoreComponent implements OnInit {

  public restockHours = RULES.STORE.RESTOCK_HOURS;
  public storeItems = STORE_ITEMS.filter((item) => AVAILABLE_ITEMS.indexOf(item.id) !== -1);
  public availabilityMap: Map<string, number> = new Map<string, number>();

  public chestPopupControl = new FormControl();

  constructor(private storeService: StoreService,
              private popupService: PopupService) { }

  ngOnInit(): void {
    this.storeService.myPurchases$.subscribe((purchases) => {
        this.availabilityMap = new Map<string, number>(this.storeItems.map((item) =>
            [item.id, StoreHelperService.getItemStock(item.id, purchases)]
        ))
    });
  }

  buyItem(item: StoreItem) {
    this.storeService.buyItem(item.id).subscribe(() => {
        console.log('Item bought');
        if(item.id === 'chest') {
          this.popupService.showPopup(this.chestPopupControl.value);
        }
    });
  }

}
