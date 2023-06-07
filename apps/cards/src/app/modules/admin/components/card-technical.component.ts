import {Component, Input} from '@angular/core';
import Card from "../../../../../../shared/interfaces/card.interface";

@Component({
    selector: 'app-card-technical',
    template: `
<pre class="m-0">
<b>{{card.title}} {{card.value}}p</b>
-{{card.energyCost}}e +{{card.coinsReward}}c
-{{card.coinsCost}}c +{{card.energyReward}}e
</pre>
    `,
    styleUrls: []
})
export class CardTechnicalComponent {

    @Input() public card: Card;

    constructor() { }

}
