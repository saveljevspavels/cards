import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Ability, AbilityKey} from "../../../../../../../shared/interfaces/ability.interface";
import {GameService} from "../../../../services/game.service";
import {PopupService} from "../../../../services/popup.service";
import {ButtonType} from "../../../shared/components/button/button.component";

@Component({
  selector: 'app-ability',
  templateUrl: './ability.component.html',
  styleUrls: ['./ability.component.scss']
})
export class AbilityComponent {

  readonly ButtonType = ButtonType;

  @Input() ability: Ability;
  @Input() showActivationButton: boolean = false;

  public loading = false;

  @ViewChild('activateAbilityPopup', { static: true }) activateAbilityPopup: ElementRef;

  constructor(
      private gameService: GameService,
      private popupService: PopupService
  ) { }

  useAbility(activityKey: AbilityKey) {
    this.loading = true;
    this.gameService.useAbility(activityKey).subscribe(() => {
      this.loading = false;
    }, (err) => {
      this.loading = false;
    });
  }

  openConfirmation() {
    this.popupService.showPopup(this.activateAbilityPopup);
  }

  cancel() {
    this.popupService.closePopup();
  }

  confirm(activityKey: AbilityKey) {
    this.useAbility(activityKey);
    this.popupService.closePopup();
  }
}
