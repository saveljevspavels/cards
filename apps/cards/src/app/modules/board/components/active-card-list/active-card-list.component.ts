import {Component, OnInit} from '@angular/core';
import {CardService} from "../../../../services/card.service";
import {AthleteService} from "../../../../services/athlete.service";
import {combineLatest, Observable} from "rxjs";
import Athlete from "../../../../../../../shared/interfaces/athlete.interface";
import {BoardService} from "../../../../services/board.service";
import {ValidationService} from "../../../../services/validation.service";
import Card from "../../../../../../../shared/interfaces/card.interface";
import {ValidationStatus} from "../../../../../../../shared/services/validation.service";
import {FormControl} from "@angular/forms";
import {ActivityService} from "../../../../services/activity.service";

@Component({
  selector: 'app-active-card-list',
  templateUrl: './active-card-list.component.html',
  styleUrls: ['./active-card-list.component.scss']
})
export class ActiveCardListComponent implements OnInit {

  public athlete: Observable<Athlete | null> = this.athleteService.me;
  public selectedActivity$ = this.boardService.selectedActivity$;
  public remainderActivity: any = null;

  public cardList: ValidatedCard[];
  public selectedCards: FormControl = new FormControl([]);
  
  constructor(
      private cardService: CardService,
      private athleteService: AthleteService,
      private boardService: BoardService,
      private validationService: ValidationService,
      private activityService: ActivityService
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

      this.cardList = athlete?.activeCards.map(activeCard => {
        const card = this.cardService.getCard(activeCard.id);
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

  submitActivity() {
    this.activityService.submitActivity(
        this.selectedActivity.id,
        this.selectedCards.value.map((validatedCard: ValidatedCard) => validatedCard.card.id),
        [],
        []
    ).subscribe(res => console.log('res', res))
  }
}

interface ValidatedCard {
  card: Card,
  validationStatus: ValidationStatus
}
