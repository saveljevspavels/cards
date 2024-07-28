import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {ConstService} from "../../../../services/const.service";
import {BehaviorSubject, combineLatest, Subject} from "rxjs";
import {Card} from "../../../../../../../shared/classes/card.class";
import {CardScheme, CardSchemeBoard} from "../../../../../../../shared/interfaces/card-scheme.interface";
import {CardService, ValidatedCard} from "../../../../services/card.service";
import {AthleteService} from "../../../../services/athlete.service";
import {distinctUntilChanged, filter, first, map, startWith, tap} from "rxjs/operators";
import {PopupService} from "../../../../services/popup.service";
import {LocalStorageService} from "../../../../services/local-storage.service";
import {Activity} from "../../../../../../../shared/interfaces/activity.interface";
import {BoardService} from "../../../../services/board.service";
import {ValidationService} from "../../../../services/validation.service";
import {ValidationStatus} from "../../../../../../../shared/services/validation.service";

@Component({
  selector: 'app-card-scheme',
  templateUrl: './card-scheme.component.html',
  styleUrls: ['./card-scheme.component.scss']
})
export class CardSchemeComponent implements OnInit {
    public CONST = ConstService.CONST
    public RULES = ConstService.RULES
    public allCards: BehaviorSubject<Card[]> = this.cardService.cards;
    public cardScheme: BehaviorSubject<CardScheme> = this.cardService.cardScheme;
    public athlete = this.athleteService.me;

    public loading = false;

    @Input() title = '';
    @Input() showLocked = true;
    @Input() selectedCards: FormControl<ValidatedCard[] | null> = new FormControl<ValidatedCard[]>([]);
    // @Input() commentControl: FormControl<string | null> = new FormControl<string>('');
    @Input() uploadedImages: FormGroup = this.formBuilder.group({});
    @Input() cardComments: FormGroup = this.formBuilder.group({});

    private unlock$ = new Subject();
    @ViewChild('unlockPopup', { static: true }) unlockPopup: ElementRef;
    @ViewChild('activatePopup', { static: true }) activatePopup: ElementRef;

    public boards: CardSchemeBoard[] = [];
    public activeBoard = this.formBuilder.control<CardSchemeBoard | null>(null);

    public cardMap: Map<string, ValidatedCard> = new Map([]);
    public unlockMap: Map<string, number>;

    constructor(private formBuilder: FormBuilder,
                private cardService: CardService,
                private boardService: BoardService,
                private athleteService: AthleteService,
                private popupService: PopupService,
                private validationService: ValidationService,
    ) { }

    ngOnInit(): void {
        combineLatest([
            this.cardScheme.pipe(
                tap((scheme: CardScheme) => {
                    if(!this.activeBoard.value && scheme.boards.length) {
                        this.activeBoard.setValue(this.getBoardByKey(LocalStorageService.getValue('activeBoard')) || scheme.boards[0]);
                    }
                })
            ),
            this.athlete,
            this.allCards,
            this.boardService.selectedActivity$.pipe(startWith(null)),
        ])
            .pipe(distinctUntilChanged())
            .subscribe(([scheme, athlete, cards, activity]) => {
            if(!scheme?.boards.length || !athlete || !cards.length) {
                return;
            }
            this.boards = scheme.boards;

            this.unlockMap = new Map<string, number>(this.boards.map((board) => {
                return [board.key, athlete.unlocks[board.key] || 0];
            }))
            const usedCards = Object.values(athlete.cards).reduce((acc, cards) => [...cards, ...acc], []);

            this.cardMap = this.getValidatedCardMap(cards.filter(card => usedCards.indexOf(card.id) === -1));

            this.addFormControlsForIds(this.uploadedImages, [...this.cardMap.keys()]);
            this.addFormControlsForIds(this.cardComments, [...this.cardMap.keys()]);
        });
    }

    cardClicked(validatedCard: ValidatedCard) {
        if(validatedCard.validationStatus === ValidationStatus.NONE) {
            return;
        }
        const selectedCards = this.selectedCards.value || [];
        switch (validatedCard.validationStatus) {
            case ValidationStatus.PASS:
                if(!selectedCards.find((selectedCard: ValidatedCard) => validatedCard.card.id === selectedCard.card.id)) {
                    this.selectedCards.setValue([...selectedCards, validatedCard]);
                }
                break;
            case ValidationStatus.SELECTED:
                if(selectedCards.find((selectedCard: ValidatedCard) => validatedCard.card.id === selectedCard.card.id)) {
                    selectedCards.splice(selectedCards.findIndex(((selectedCard: ValidatedCard) => validatedCard.card.id === selectedCard.card.id)), 1)
                    this.selectedCards.setValue(selectedCards);
                }
                break;
        }

        this.cardMap = this.getValidatedCardMap(this.cardService.getPlainCards([...this.cardMap.values()]));
    }

    getValidatedCardMap(cards: Card[]): Map<string, ValidatedCard> {
        return new Map<string, ValidatedCard>(cards
            .map(card => {
            return [card.id, {
                card,
                validationStatus: this.cardService.validateCard(this.boardService.activity, card, this.selectedCards.value)
            }]
        }));
    }

    setActiveBoard(boardKey: string) {
        this.activeBoard.setValue(this.getBoardByKey(boardKey));
        LocalStorageService.setValue('activeBoard', boardKey);
    }

    unlockLevel(boardKey: string) {
        this.unlock$.pipe(
            first(),
            filter((resolution) => !!resolution)
        ).subscribe(_ => {
            this.cardService.unlockLevel(boardKey).subscribe(() => {
                this.loading = false;
            }, () => {
                this.loading = false;
            });
        })
        this.popupService.showPopup(this.unlockPopup);
    }

    confirmUnlock() {
        this.unlock$.next(true);
        this.popupService.closePopup();
    }

    cancelUnlock() {
        this.unlock$.next(false);
        this.loading = false;
        this.popupService.closePopup();
    }

    getBoardByKey(key: string): CardSchemeBoard | null {
        return this.boards.find(board => board.key === key) || null;
    }

    addFormControlsForIds(formGroup: FormGroup, ids: string[]) {
        ids.forEach(id => {
            if(!formGroup.get(id)) {
                formGroup.addControl(id, new FormControl([]));
            }
        });
    }
}
