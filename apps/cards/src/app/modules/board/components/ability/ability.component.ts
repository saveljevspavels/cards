import {Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {Ability, AbilityKey} from "../../../../../../../shared/interfaces/ability.interface";
import {GameService} from "../../../../services/game.service";
import {PopupService} from "../../../../services/popup.service";
import {ButtonType} from "../../../shared/components/button/button.component";
import {ABILITIES} from "../../../../../../../../definitions/abilities";

@Component({
  selector: 'app-ability',
  templateUrl: './ability.component.html',
  styleUrls: ['./ability.component.scss']
})
export class AbilityComponent implements OnChanges {

  readonly ButtonType = ButtonType;

  @Input() ability: Ability;
  @Input() abilityKey: string;
  @Input() level: number;
  @Input() showActivationButton: boolean = false;

  public loading = false;

  @ViewChild('activateAbilityPopup', { static: true }) activateAbilityPopup: ElementRef;

  constructor(
      private gameService: GameService,
      private popupService: PopupService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.abilityKey ) {
      const ability: Ability | undefined = ABILITIES.find((ability) => ability.key === this.abilityKey);
        if (ability) {
            this.ability = ability;
        }
    }
  }

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
