import { Component, OnInit } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {DeckService} from "../../../../services/deck.service";
import {FormControl} from "@angular/forms";
import {AdminService} from "../../admin.service";

@Component({
    selector: 'app-admin-deck',
    templateUrl: './admin-deck.component.html',
    styleUrls: ['./admin-deck.component.scss']
})
export class AdminDeckComponent implements OnInit {

    public selectedCards = new FormControl([]);
    public allCards: BehaviorSubject<any> = this.deckService.cards;

    constructor(private deckService: DeckService,
                private adminService: AdminService) { }

    ngOnInit(): void {
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
