import {Component, EventEmitter, Input, Output} from "@angular/core";
import {StoreItem} from "../../../../../../../../shared/interfaces/store-item.interface";
import {AthleteService} from "../../../../../services/athlete.service";

@Component({
    selector: 'app-store-item',
    templateUrl: 'store-item.component.html',
    styleUrls: ['store-item.component.scss']
})
export class StoreItemComponent {

    @Input() item: StoreItem;
    @Input() stock: number;

    public athlete  = this.athleteService.me;

    @Output() buy = new EventEmitter<void>();

    constructor(private athleteService: AthleteService) {
    }

    buyItem() {
        this.buy.emit();
    }
}