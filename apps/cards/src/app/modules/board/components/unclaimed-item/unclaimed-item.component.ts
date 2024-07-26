import {Component, EventEmitter, Input, Output} from "@angular/core";
import {StoreItem} from "../../../../../../../shared/interfaces/store-item.interface";

@Component({
    selector: 'app-unclaimed-item',
    templateUrl: './unclaimed-item.component.html',
    styleUrls: ['./unclaimed-item.component.scss']
})
export class UnclaimedItemComponent {

    @Input() item: StoreItem;
    @Output() activate = new EventEmitter<void>();

    activateItem() {
        this.activate.emit();
    }
}