import {Component, Input, OnInit} from '@angular/core';
import {Card} from "../../../../../../shared/classes/card.class";

@Component({
    selector: 'app-card-technical',
    template: `
        <div class="m-0 d-flex flex-column">
            <div class="d-flex align-items-center">
                <div [ngStyle]="{'width.px': '20', 'height.px': '20', 'background-size': 'cover'}"
                     [style.background-image]="'url(' + card.getImageSource() + ')'"
                ></div>
                <b>{{ card.title }}</b>
            </div>
            <app-rewards [rewards]="card.rewards"></app-rewards>
            <div>id:{{ card.id }}</div>
        </div>
    `,
    styleUrls: []
})
export class CardTechnicalComponent implements OnInit {

    @Input() public card: Card;
    constructor() { }

    ngOnInit(): void {
    }
}
