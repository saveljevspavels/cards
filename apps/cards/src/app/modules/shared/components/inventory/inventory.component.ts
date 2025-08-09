import {Component, ElementRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Currencies} from "../../../../../../../shared/classes/currencies.class";
import {PopupService} from "../../../../services/popup.service";
import {FormControl} from "@angular/forms";
import {GameService} from "../../../../services/game.service";
import {Ability, AbilityKey} from "../../../../../../../shared/interfaces/ability.interface";
import {ABILITIES} from "../../../../../../../../definitions/abilities";
import {STORE_ITEMS} from "../../../../../../../../definitions/storeItems";
import {StoreItem} from "../../../../../../../shared/interfaces/store-item.interface";
import { CONST } from '../../../../../../../../definitions/constants';
import { AthleteService } from '../../../../services/athlete.service';

@Component({
    selector: 'app-inventory',
    templateUrl: './inventory.component.html',
    styleUrl: './inventory.component.scss',
})
export class InventoryComponent {

    public inventoryItems = this.athleteService.inventoryItems;

    public activatedAbility: Ability | null;

    public rewards: Currencies = new Currencies();

    public selectedAbility = new FormControl('');
    public abilitySelectionPopupControl = new FormControl();
    public abilityGainedPopupControl = new FormControl();
    public loadingPopupControl = new FormControl();
    public rewardsPopupControl = new FormControl();

    constructor(
        private popupService: PopupService,
        private gameService: GameService,
        private athleteService: AthleteService,
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
        this.setLoading();
        const abilityKey = this.selectedAbility.value[0] as AbilityKey;
        this.gameService.useAbility(abilityKey || '').subscribe(() => {
            this.selectedAbility.setValue('');
            this.closePopup();
            setTimeout(() => {
                this.showActivatedAbility(abilityKey);
            });
        });
    }

    getRandomAbility() {
        this.setLoading();
        this.gameService.getRandomAbility().subscribe((abilityKey: AbilityKey) => {
            this.closePopup();
            this.showActivatedAbility(abilityKey);
        });
    }

    activateItem(item: StoreItem) {
        switch (item.id) {
            case 'chest':
                this.openChest();
                break;
            case 'perk':
                this.openAbilitySelection();
                break;
            case 'random_perk':
                this.getRandomAbility();
                break;
        }
    }

    setLoading() {
        this.popupService.showPopup(this.loadingPopupControl.value);
    }

    closePopup() {
        this.selectedAbility.setValue('');
        this.popupService.closePopup();
    }

    openChest() {
        this.setLoading();
        this.gameService.openChest().subscribe((rewards) => {
            this.closePopup();
            this.rewards = rewards;
            this.popupService.showPopup(this.rewardsPopupControl.value);
            console.log('got rewards', rewards);
        });
    }

    protected readonly storeItems = STORE_ITEMS;
    protected readonly close = close;
}
