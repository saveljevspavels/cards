import {Component, Input, OnInit} from '@angular/core';
import {Card} from "../../../../../../shared/classes/card.class";

@Component({
    selector: 'app-card-technical',
    template: `
<div class="m-0 d-flex flex-column">
    <div class="d-flex align-items-center">
        <div [ngStyle]="{'width.px': '20', 'height.px': '20', 'background-size': 'cover'}"
             [style.background-image]="'url(../../../assets/cards/' + imageName + '.png)'"
        ></div>
        <b>{{card.title}}</b>
    </div>
    <app-rewards [rewards]="card.rewards"></app-rewards>
    <div>id:{{card.id}}</div>
</div>
    `,
    styleUrls: []
})
export class CardTechnicalComponent implements OnInit {

    @Input() public card: Card;
    public imageName = '';
    constructor() { }

    ngOnInit(): void {
        this.imageName = this.card.title
            .toLowerCase()
            .replace(/[.,!?\-'()]/g, '')
            .replace(/\s+/g, '_');
    }
}
