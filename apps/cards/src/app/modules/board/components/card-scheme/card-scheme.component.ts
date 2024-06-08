import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl} from "@angular/forms";
import {ConstService} from "../../../../services/const.service";
import {BehaviorSubject, combineLatest, Subject} from "rxjs";
import Card, {NullCard} from "../../../../../../../shared/interfaces/card.interface";
import {CardScheme, CardSchemeBoard} from "../../../../../../../shared/interfaces/card-scheme.interface";
import {CardService} from "../../../../services/card.service";
import {AthleteService} from "../../../../services/athlete.service";
import {distinctUntilChanged, filter, first, map} from "rxjs/operators";
import {PopupService} from "../../../../services/popup.service";
import {Router} from "@angular/router";
import {LocalStorageService} from "../../../../services/local-storage.service";
import {AthleteHelperService} from "../../../../services/athlete.helper.service";

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

    private unlock$ = new Subject();
    private activate$ = new Subject();
    public activatedCard$ = new BehaviorSubject<Card>(NullCard);
    @ViewChild('unlockPopup', { static: true }) unlockPopup: ElementRef;
    @ViewChild('activatePopup', { static: true }) activatePopup: ElementRef;

    public boards: CardSchemeBoard[] = [];
    public activeBoard = this.formBuilder.control('');

    public cardMap: Map<string, Card>
    public unlockMap: Map<string, number>;

    public selectedCard: FormControl = this.formBuilder.control([]);

    constructor(private formBuilder: FormBuilder,
                private cardService: CardService,
                private athleteService: AthleteService,
                private popupService: PopupService,
    ) { }

    ngOnInit(): void {
        combineLatest([
            this.cardScheme,
            this.athlete,
            this.allCards
        ])
            .pipe(distinctUntilChanged())
            .subscribe(([scheme, athlete, cards]) => {
            if(!scheme?.boards.length || !athlete || !cards.length) {
                return;
            }
            this.boards = scheme.boards;
            if(!this.activeBoard.value && scheme.boards.length) {
                this.activeBoard.setValue(LocalStorageService.getValue('activeBoard') || this.boards[0].key);
            }
            this.unlockMap = new Map<string, number>(this.boards.map((board) => {
                return [board.key, athlete.unlocks[board.key] || 0];
            }))
            const usedCards = Object.values(athlete.cards).reduce((acc, cards) => [...cards, ...acc], []);
            this.cardMap = new Map<string, Card>(cards
                .filter(card => usedCards.indexOf(card.id) === -1)
                .map(card => {
                    return [card.id, card]
                }
            ));
        })
    }

    activateCard(card: Card) {
        if(!card) {
            return;
        }
        this.loading = true;
        this.activate$.pipe(
            first(),
            filter((resolution) => !!resolution)
        ).subscribe(_ => {
            this.cardService.activateCard(card.id).subscribe(() => {
                this.loading = false;
            }, () => {
                this.loading = false;
            });
        });
        this.activatedCard$.next(card);
        this.popupService.showPopup(this.activatePopup);
    }

    confirmActivate() {
        this.activate$.next(true);
        this.activatedCard$.next(NullCard);
        this.popupService.closePopup();
    }

    cancelActivate() {
        this.activate$.next(false);
        this.activatedCard$.next(NullCard);
        this.loading = false;
        this.popupService.closePopup();
    }

    setActiveBoard(boardName: string) {
        this.activeBoard.setValue(boardName);
        LocalStorageService.setValue('activeBoard', boardName);
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
}
