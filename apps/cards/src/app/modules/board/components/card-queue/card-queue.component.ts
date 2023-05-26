import {Component, forwardRef, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {DeckService} from "../../../../services/deck.service";
import {Observable} from "rxjs";
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import Card from "../../../../../../../shared/interfaces/card";
import {AthleteService} from "../../../../services/athlete.service";

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

    @Input() selectionEnabled = true;
    @Input() filterData: any;

    public cardQueue: Observable<Card[]> = this.deckService.cardQueue.asObservable()
    public selectedCards = new FormControl([]);

    constructor(public deckService: DeckService,
                public athleteService: AthleteService) { }

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
