import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-card-factory',
  templateUrl: './card-factory.component.html',
  styleUrls: ['./card-factory.component.scss']
})
export class CardFactoryComponent implements OnInit {

    @Input()
    public cardFactory: any;

    @Output()
    public select = new EventEmitter();

    constructor() { }

    ngOnInit(): void {
    }

    selectFactory() {
        this.select.emit(this.cardFactory)
    }
}
