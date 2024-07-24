import {Component, Input} from '@angular/core';
import {Card} from "../../../../../../shared/classes/card.class";

@Component({
    selector: 'app-card-technical',
    template: `
<pre class="m-0">
<b>{{card.title}} {{card.rewards.points}}p</b>
-{{card.energyCost}}e +{{card.rewards.coins}}c
-{{card.coinsCost}}c +{{card.rewards.energy}}e
id:{{card.id}}
</pre>
    `,
    styleUrls: []
})
export class CardTechnicalComponent {

    @Input() public card: Card;

    constructor() { }

}
