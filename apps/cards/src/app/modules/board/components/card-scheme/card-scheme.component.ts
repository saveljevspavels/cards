import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl} from "@angular/forms";
import {ConstService} from "../../../../services/const.service";
import {BehaviorSubject, combineLatest, Subject} from "rxjs";
import Card from "../../../../../../../shared/interfaces/card.interface";
import {CardScheme, CardSchemeBoard} from "../../../../../../../shared/interfaces/card-scheme.interface";
import {CardService} from "../../../../services/card.service";
import {AthleteService} from "../../../../services/athlete.service";
import {distinctUntilChanged, filter, first} from "rxjs/operators";
import {PopupService} from "../../../../services/popup.service";
import {Router} from "@angular/router";

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

    private unlock$ = new Subject();
    private activate$ = new Subject();
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
                private router: Router
    ) { }

    ngOnInit(): void {
        combineLatest([
            this.cardScheme,
            this.athlete,
            this.allCards
        ])
            .pipe(distinctUntilChanged())
            .subscribe(([scheme, athlete, cards]) => {
                console.log(scheme, athlete, cards)
            if(!scheme?.boards.length || !athlete || !cards.length) {
                return;
            }
            this.boards = scheme.boards;
            if(!this.activeBoard.value && scheme.boards.length) {
                this.activeBoard.setValue(this.boards[0].key);
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

    activateCard(cardId: string) {
        if(!cardId) {
            return;
        }
        this.activate$.pipe(
            first(),
            filter((resolution) => !!resolution)
        ).subscribe(_ => {
            this.cardService.activateCard(cardId).subscribe();
            this.router.navigateByUrl('');
        });
        this.popupService.showPopup(this.activatePopup);
    }

    confirmActivate() {
        this.activate$.next(true);
        this.popupService.closePopup();
    }

    cancelActivate() {
        this.activate$.next(false);
        this.popupService.closePopup();
    }

    unlockLevel(boardKey: string, level: number) {
        this.unlock$.pipe(
            first(),
            filter((resolution) => !!resolution)
        ).subscribe(_ => {
            this.cardService.unlockLevel(boardKey, level).subscribe();
        })
        this.popupService.showPopup(this.unlockPopup);
    }

    confirmUnlock() {
        this.unlock$.next(true);
        this.popupService.closePopup();
    }

    cancelUnlock() {
        this.unlock$.next(false);
        this.popupService.closePopup();
    }
}
