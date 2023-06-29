import {Component, OnInit} from '@angular/core';
import {CardService} from "../../../../services/card.service";
import {AthleteService} from "../../../../services/athlete.service";
import {combineLatest, Observable} from "rxjs";
import Athlete from "../../../../../../../shared/interfaces/athlete.interface";
import {BoardService} from "../../../../services/board.service";
import {ValidationService} from "../../../../services/validation.service";
import Card from "../../../../../../../shared/interfaces/card.interface";
import {ValidationStatus} from "../../../../../../../shared/services/validation.service";
import {FormArray, FormControl} from "@angular/forms";
import {ActivityService} from "../../../../services/activity.service";
import {Router} from "@angular/router";
import {RULES} from "../../../../../../../../definitions/rules";
import {ConstService} from "../../../../services/const.service";
import {mergeMap} from "rxjs/operators";
import {FileService} from "../../../../services/file.service";

@Component({
  selector: 'app-active-card-list',
  templateUrl: './active-card-list.component.html',
  styleUrls: ['./active-card-list.component.scss']
})
export class ActiveCardListComponent implements OnInit {
  public RULES = RULES;
  public athlete: Observable<Athlete | null> = this.athleteService.me;
  public selectedActivity$ = this.boardService.selectedActivity$;
  public remainderActivity: any = null;

  public cardList: ValidatedCard[] = [];
  public selectedCards: FormControl = new FormControl([]);
  public uploadedImages: FormArray;

  public loading = false;
  
  constructor(
      private cardService: CardService,
      private athleteService: AthleteService,
      private boardService: BoardService,
      private validationService: ValidationService,
      private activityService: ActivityService,
      private router: Router,
      private fileService: FileService
  ) { }

  get selectedActivity() {
    return this.boardService.activity;
  }

  ngOnInit(): void {
    combineLatest([
      this.athlete,
      this.cardService.cards,
      this.selectedActivity$
    ]).subscribe(([athlete, cards, activity]) => {
      this.selectedCards.setValue([]);
      if(!athlete && !cards) {
        this.cardList = [];
        return;
      }

      if(this.cardList.length !== this.uploadedImages?.controls?.length) {
        this.uploadedImages = new FormArray([
          ...this.cardList.map(_ => new FormControl([]))
        ]);
      }

      this.cardList = athlete?.cards.active.map(cardId => {
        const card = this.cardService.getCard(cardId);
        return {
          card,
          validationStatus: this.validateCard(activity, card, this.selectedCards.value)
        }
      }) || [];
      this.remainderActivity = this.validationService.getActivityRemainder(activity, this.getPlainCards(this.selectedCards.value));
    });
  }

  updateValidations() {
    this.cardList = this.cardList.map((validatedCard => {
      return {
        ...validatedCard,
        validationStatus: this.validateCard(this.selectedActivity, validatedCard.card, this.selectedCards.value)
      }
    }))
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
        .map((id: string) => this.cardList.findIndex(card => card.card.id === id))
        .map((index: number) => this.uploadedImages.get(index.toString())?.value)
    images = await Promise.all(images.map(async (imageGroup: File[]) => await this.fileService.uploadImages(imageGroup)))


    this.activityService.submitActivity(
        this.selectedActivity.id,
        cardIds,
        images,
        []
    ).subscribe(_ => {
      this.boardService.deselectActivity();
      this.loading = false;
    })
  }

  openCardScheme() {
    this.router.navigateByUrl('board/board');
  }

  cardTrackBy(index: number, item: ValidatedCard){
    return item.card.id;
  }
}

interface ValidatedCard {
  card: Card,
  validationStatus: ValidationStatus
}
