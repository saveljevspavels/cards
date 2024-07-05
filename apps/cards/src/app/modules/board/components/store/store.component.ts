import { Component, OnInit } from '@angular/core';
import {STORE_ITEMS} from "../../../../../../../../definitions/storeItems";
import {StoreService} from "../../../../services/store.service";
import {StoreHelperService} from "../../../../../../../shared/services/store.helper.service";

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})
export class StoreComponent implements OnInit {

  public storeItems = STORE_ITEMS;
  public availabilityMap: Map<string, number> = new Map<string, number>();

  constructor(private storeService: StoreService) { }

  ngOnInit(): void {
    this.storeService.myPurchases$.subscribe((purchases) => {
        this.availabilityMap = new Map<string, number>(this.storeItems.map((item) =>
            [item.id, StoreHelperService.getItemStock(item.id, purchases)]
        ))
    });
  }

  buyItem(itemId: string) {
    this.storeService.buyItem(itemId).subscribe(() => {
        console.log('Item bought');
    });
  }

}
