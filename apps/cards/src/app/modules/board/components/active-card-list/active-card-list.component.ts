import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CardService} from "../../../../services/card.service";
import {AthleteService} from "../../../../services/athlete.service";
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import Athlete from "../../../../../../../shared/interfaces/athlete.interface";
import {BoardService} from "../../../../services/board.service";
import {ValidationService} from "../../../../services/validation.service";
import Card, {NullCard} from "../../../../../../../shared/interfaces/card.interface";
import {StaticValidationService, ValidationStatus} from "../../../../../../../shared/services/validation.service";
import {FormArray, FormControl} from "@angular/forms";
import {ActivityService} from "../../../../services/activity.service";
import {Router} from "@angular/router";
import {RULES} from "../../../../../../../../definitions/rules";
import {FileService} from "../../../../services/file.service";
import {GameService} from "../../../../services/game.service";
import {filter, first, map, startWith} from "rxjs/operators";
import {PopupService} from "../../../../services/popup.service";
import {ConstService} from "../../../../services/const.service";
import {ButtonType} from "../../../shared/components/button/button.component";

@Component({
  selector: 'app-active-card-list',
  templateUrl: './active-card-list.component.html',
  styleUrls: ['./active-card-list.component.scss']
})
export class ActiveCardListComponent implements OnInit {
  readonly ButtonType = ButtonType;
  public RULES = RULES;
  public athlete: Observable<Athlete | null> = this.athleteService.me;
  public selectedActivity$ = this.boardService.selectedActivity$;
  public notEnoughEnergy$ = new BehaviorSubject<boolean>(false);
  public remainderActivity: any = null;

  public featuredCard: ValidatedCard | null;
  public cardList: ValidatedCard[] = [];
  public selectedCards: FormControl = new FormControl([]);
  public commentControl: FormControl = new FormControl('');
  public uploadedImages: FormArray;

  private submitConfirmation = new Subject;
  @ViewChild('submitConfirmPopup', { static: true }) submitConfirmPopup: ElementRef;

  public loading = false;
  
  constructor(
      private cardService: CardService,
      private athleteService: AthleteService,
      private boardService: BoardService,
      private validationService: ValidationService,
      private activityService: ActivityService,
      private router: Router,
      private fileService: FileService,
      private gameService: GameService,
      private popupService: PopupService
  ) { }

  get selectedActivity() {
    return this.boardService.activity;
  }

  ngOnInit(): void {
    combineLatest([
      this.athlete.pipe(startWith(null)),
      this.cardService.cards.pipe(startWith(null)),
      this.selectedActivity$.pipe(startWith(null)),
      this.gameService.gameData.pipe(startWith(null))
    ]).subscribe(([athlete, cards, activity, game]) => {
      this.selectedCards.setValue([]);
      if(!athlete && !cards) {
        this.cardList = [];
        return;
      }

      if(game && game.featuredCard) {
        const featuredCard = this.cardService.getCard(game.featuredCard);
        this.featuredCard = [...athlete?.cards?.completed || [], ...athlete?.cards?.finished || []].indexOf(featuredCard.id) === -1 ? {
          card: featuredCard,
          validationStatus: this.validateCard(activity, featuredCard, this.selectedCards.value)
        } : null;
      } else {
        this.featuredCard = null;
      }

      this.cardList = athlete?.cards.active.map(cardId => {
        const card = this.cardService.getCard(cardId);
        return {
          card,
          validationStatus: this.validateCard(activity, card, this.selectedCards.value)
        }
      }) || [];

      const cardAmount = this.cardList.length + (this.featuredCard ? 1 : 0);
      if((this.uploadedImages?.length || 0) !== cardAmount) {
        this.uploadedImages = new FormArray([
          ...Array(cardAmount).fill(null).map(_ => new FormControl([]))
        ]);
      }
      this.remainderActivity = this.validationService.getActivityRemainder(activity, this.getPlainCards(this.selectedCards.value));
    });

    this.selectedCards.valueChanges.subscribe(selectedCards => {
      this.updateEnergyCheck(selectedCards);
    })
  }

  updateValidations() {
    this.cardList = this.cardList.map((validatedCard => {
      return {
        ...validatedCard,
        validationStatus: this.validateCard(this.selectedActivity, validatedCard.card, this.selectedCards.value)
      }
    }))
    if(this.featuredCard) {
      this.featuredCard.validationStatus = this.validateCard(this.selectedActivity, this.featuredCard.card, this.selectedCards.value);
    }
    this.remainderActivity = this.validationService.getActivityRemainder(this.selectedActivity, this.getPlainCards(this.selectedCards.value));
  }

  cardPasses(card: Card) {
    this.validationService.validateCards(this.boardService.activity, [card])
  }

  validateCard(activity: any, card: Card, selectedCards: ValidatedCard[]) {
    if(!activity) {
      return ValidationStatus.NONE;
    }

    if(selectedCards.find(validatedCard => validatedCard.card === card)) {
      return ValidationStatus.SELECTED
    }

    return this.validationService.validateCardGroup(
        activity,
        [
          ...this.getPlainCards(this.selectedCards.value),
          card
        ])
        ? ValidationStatus.PASS
        : ValidationStatus.FAIL;

  }

  cardSelected(validatedCard: ValidatedCard) {
    if(validatedCard.validationStatus === ValidationStatus.NONE) {
      return;
    }
    switch (validatedCard.validationStatus) {
      case ValidationStatus.PASS:
        if(!this.selectedCards.value.find((selectedCard: ValidatedCard) => validatedCard.card.id === selectedCard.card.id)) {
          this.selectedCards.setValue([...this.selectedCards.value, validatedCard]);
        }
        break;
      case ValidationStatus.SELECTED:
        if(this.selectedCards.value.find((selectedCard: ValidatedCard) => validatedCard.card.id === selectedCard.card.id)) {
          const selectedCards = this.selectedCards.value;
          selectedCards.splice(selectedCards.findIndex(((selectedCard: ValidatedCard) => validatedCard.card.id === selectedCard.card.id)), 1)
          this.selectedCards.setValue(selectedCards);
        }
        break;
    }
    this.updateValidations();
  }

  getPlainCards(validatedCards: ValidatedCard[]) {
    return validatedCards.map((validatedCard: ValidatedCard) => validatedCard.card);
  }

  async submitActivity() {
    this.loading = true;

    const cardIds = this.selectedCards.value.map((validatedCard: ValidatedCard) => validatedCard.card.id);
    let images = cardIds
        .map((id: string) => {
          const index = this.cardList.findIndex(card => card.card.id === id)
          return index !== -1 ? index : this.cardList.length
        })
        .map((index: number) => this.uploadedImages.get(index.toString())?.value);


    this.submitConfirmation.pipe(first()).subscribe(async confirmed => {
      if(confirmed) {
        images = await Promise.all(images.map(async (imageGroup: File[]) => await this.fileService.uploadImages(imageGroup)))

        this.activityService.submitActivity(
            this.selectedActivity.id,
            cardIds,
            images,
            this.commentControl.value.slice(0, ConstService.CONST.COMMENT_LENGTH),
        ).subscribe(_ => {
          this.boardService.deselectActivity();
          this.selectedCards.setValue([]);
          this.commentControl.setValue('');
          this.loading = false;
        }, (error => {
          this.selectedCards.setValue([]);
          this.commentControl.setValue('');
          this.loading = false;
        }))
      }
    })

    if(images.find((imageSet: string[]) => !imageSet.length)) {
      this.popupService.showPopup(this.submitConfirmPopup);
    } else {
      this.confirmSubmit();
    }
  }

  openCardScheme() {
    this.router.navigateByUrl('board/board');
  }

  cardTrackBy(index: number, item: ValidatedCard){
    return item.card.id;
  }

  confirmSubmit() {
    this.popupService.closePopup();
    this.submitConfirmation.next(true);
  }

  cancelSubmit() {
    this.loading = false;
    this.submitConfirmation.next(false);
    this.popupService.closePopup();
  }

  updateEnergyCheck(selectedCards: ValidatedCard[]) {
    this.athlete.pipe(first(), map((athlete) => athlete?.energy || 0)).subscribe((availableEnergy: number) => {
      this.notEnoughEnergy$.next(StaticValidationService.notEnoughEnergy(availableEnergy, this.getPlainCards(selectedCards)));
    });
  }
}

interface ValidatedCard {
  card: Card,
  validationStatus: ValidationStatus
}
