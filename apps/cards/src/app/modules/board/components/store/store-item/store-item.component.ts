import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {StoreItem} from "../../../../../../../../shared/interfaces/store-item.interface";
import {AthleteService} from "../../../../../services/athlete.service";
import {filter} from "rxjs/operators";

@Component({
    selector: 'app-store-item',
    templateUrl: 'store-item.component.html',
    styleUrls: ['store-item.component.scss']
})
export class StoreItemComponent implements OnInit {

    @Input() item: StoreItem;
    @Input() stock: number;

    public athlete  = this.athleteService.me;
    public finalPrice: number;

    @Output() buy = new EventEmitter<void>();

    constructor(private athleteService: AthleteService) {
    }

    ngOnInit(): void {
        if(!this.item.discountBy || !this.item.discount) {
            this.finalPrice = this.item.price;
            return;
        }
        this.athlete.pipe(
            filter((athlete) => !!athlete)
        ).subscribe((athlete) => {
            this.finalPrice = this.item.price - (athlete!.getPerkLevel(this.item.discountBy!) * this.item.discount!);
        });
    }

    buyItem() {
        this.buy.emit();
    }
}