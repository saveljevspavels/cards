import {Component, forwardRef, OnInit, ViewEncapsulation} from '@angular/core';
import {DeckService} from "../../../../services/deck.service";
import Hand from "../../../../interfaces/hand";
import {Observable} from "rxjs";
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {RULES} from "../../../../app.module";
import {GameService} from "../../../../services/game.service";

@Component({
  selector: 'app-card-queue',
  templateUrl: './card-queue.component.html',
  styleUrls: ['./card-queue.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CardQueueComponent),
    multi: true,
  }]
})
export class CardQueueComponent implements OnInit, ControlValueAccessor {

    public cardQueue: Observable<Hand> = this.deckService.cardQueue.asObservable()
    public selectedCards = new FormControl([]);

    constructor(public deckService: DeckService) { }

    ngOnInit(): void {
        this.selectedCards.valueChanges.subscribe((values: any) => {
            this._onChange(values)
        })
    }

    _onChange: any = () => {};
    _onTouched: any = () => {};

    writeValue(value: any) {
        this.selectedCards.setValue(value)
    }

    registerOnChange(fn: any) {
        this._onChange = fn;
    }

    registerOnTouched(fn: any) {
        this._onTouched = fn;
    }

}
