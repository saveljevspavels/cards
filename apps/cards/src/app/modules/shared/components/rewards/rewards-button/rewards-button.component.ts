import {Component, EventEmitter, Input, Output, ViewEncapsulation} from "@angular/core";
import {Currencies} from "../../../../../../../../shared/classes/currencies.class";

@Component({
    selector: 'app-rewards-button',
    templateUrl: './rewards-button.component.html',
    styleUrls: ['./rewards-button.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RewardsButtonComponent {

    @Input() public rewards: Currencies;
    @Input() public label: string;

    @Output() public buttonClick = new EventEmitter();

    constructor() {
    }

    public onClick() {
        this.buttonClick.emit();
    }

}