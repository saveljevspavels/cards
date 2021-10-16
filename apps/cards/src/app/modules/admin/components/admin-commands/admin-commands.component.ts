import { Component, OnInit } from '@angular/core';
import {FormControl} from "@angular/forms";
import {AdminService} from "../../admin.service";
import {BehaviorSubject} from "rxjs";
import {AthleteService} from "../../../../services/athlete.service";
import {DeckService} from "../../../../services/deck.service";

@Component({
  selector: 'app-admin-commands',
  templateUrl: './admin-commands.component.html',
  styleUrls: ['./admin-commands.component.scss']
})
export class AdminCommandsComponent implements OnInit {

    public selectedAthletes = new FormControl([]);
    public selectedCards = new FormControl([]);
    public cardAmount = new FormControl(0);
    public allAthletes: BehaviorSubject<any> = this.athleteService.athletes;
    public allCards: BehaviorSubject<any> = this.deckService.cards;

    constructor(private adminService: AdminService,
                private athleteService: AthleteService,
                private deckService: DeckService) { }

    ngOnInit(): void {
    }

    requestActivities() {
        this.adminService.requestActivities(this.selectedAthletes.value)
    }

    setDeck() {
        this.adminService.setDeck(this.selectedCards.value)
    }

    addToDeck() {
        this.adminService.addToDeck(this.selectedCards.value)
    }

    shuffleDeck() {
        this.adminService.shuffleDeck(this.selectedCards.value)
    }

    dealCards() {
        this.adminService.dealCards(this.selectedAthletes.value, this.cardAmount.value)
    }

    deleteCards() {
        this.adminService.deleteCards(this.selectedCards.value)
    }

    dealQueue() {
        this.adminService.dealQueue()
    }

    startGame() {
        this.adminService.startGame().subscribe(() => console.log('Game Started'))
    }
}
