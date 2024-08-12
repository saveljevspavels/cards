import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import {LEVEL_REWARDS} from "../../../../../../../../definitions/level_rewards";
import {RULES} from "../../../../../../../../definitions/rules";
import {Currencies} from "../../../../../../../shared/classes/currencies.class";

@Component({
  selector: 'app-level',
  templateUrl: './level.component.html',
  styleUrls: ['./level.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LevelComponent implements OnInit {
    public LEVEL_EXPERIENCE = RULES.LEVEL_EXPERIENCE;
    public LEVEL_REWARDS = LEVEL_REWARDS;

    @Input() public currencies: Currencies;
    @Input() public completed: boolean;
    @Input() public claimed: boolean;
    @Input() public progress: number;
    @Input() public levelIndex: number;
    @Input() public currentLevel: number;
    @Input() public last: boolean = false;
    @Input() public first: boolean = false;

    @Output() claim = new EventEmitter;

    constructor(
    ) { }

    ngOnInit() {

    }

    public claimReward() {
        this.claim.emit();
    }
}
