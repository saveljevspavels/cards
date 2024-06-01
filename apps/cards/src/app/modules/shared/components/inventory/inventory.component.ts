import {Component, ElementRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Currencies} from "../../../../../../../shared/classes/currencies.class";
import {PopupService} from "../../../../services/popup.service";
import {FormControl} from "@angular/forms";
import {GameService} from "../../../../services/game.service";
import {Ability, AbilityKey} from "../../../../../../../shared/interfaces/ability.interface";
import {ABILITIES} from "../../../../../../../../definitions/abilities";

@Component({
    selector: 'app-inventory',
    templateUrl: './inventory.component.html',
    styleUrl: './inventory.component.scss',
})
export class InventoryComponent {

    @Input() currencies: Currencies;

    public activatedAbility: Ability | null;

    public selectedAbility = new FormControl('');
    public abilitySelectionPopupControl = new FormControl();
    public abilityGainedPopupControl = new FormControl();

    constructor(
        private popupService: PopupService,
        private gameService: GameService
    ) {}
    openAbilitySelection() {
        this.popupService.showPopup(this.abilitySelectionPopupControl.value);
    }

    showActivatedAbility(abilityKey: AbilityKey) {
        this.activatedAbility = ABILITIES.find(ability => ability.key === abilityKey) || null;
        this.popupService.showPopup(this.abilityGainedPopupControl.value);
    }

    activatedAbilityPopupClose() {
        this.activatedAbility = null;
    }

    selectAbility() {
        if(!this.selectedAbility.value || !this.selectedAbility.value[0]) {
            return;
        }
        this.gameService.useAbility(this.selectedAbility.value[0] || '').subscribe();
        const abilityKey = this.selectedAbility.value[0] as AbilityKey;
        this.selectedAbility.setValue('');
        setTimeout(() => {
            this.showActivatedAbility(abilityKey);
        });
    }

    getRandomAbility() {
        this.gameService.getRandomAbility().subscribe((abilityKey: AbilityKey) => {
            console.log(abilityKey);
            this.showActivatedAbility(abilityKey);
        });
    }

    openChest() {
        this.gameService.openChest().subscribe((rewards) => {
            console.log('got rewards', rewards);
        });
    }

}
