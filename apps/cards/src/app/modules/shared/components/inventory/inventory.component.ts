import {Component, ElementRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Currencies} from "../../../../../../../shared/classes/currencies.class";
import {PopupService} from "../../../../services/popup.service";
import {FormControl} from "@angular/forms";
import {GameService} from "../../../../services/game.service";

@Component({
    selector: 'app-inventory',
    templateUrl: './inventory.component.html',
    styleUrl: './inventory.component.scss',
})
export class InventoryComponent {

    @Input() currencies: Currencies;

    public selectedAbility = new FormControl('');
    public abilitySelectionPopupControl = new FormControl();

    constructor(
        private popupService: PopupService,
        private gameService: GameService
    ) {}
    openAbilitySelection() {
        this.popupService.showPopup(this.abilitySelectionPopupControl.value);
    }

    selectAbility() {
        if(!this.selectedAbility.value || !this.selectedAbility.value[0]) {
            return;
        }
        this.gameService.useAbility(this.selectedAbility.value[0] || '').subscribe();
        this.selectedAbility.setValue('');
    }

}
