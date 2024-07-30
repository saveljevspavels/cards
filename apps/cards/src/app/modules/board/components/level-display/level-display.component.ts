import {Component, Input} from "@angular/core";
import {RULES} from "../../../../../../../../definitions/rules";

@Component({
    selector: 'app-level-display',
    templateUrl: './level-display.component.html',
    styleUrls: ['./level-display.component.scss']
})
export class LevelDisplayComponent {
    @Input() level: number;
    @Input() progress: number;

    public LEVEL_EXPERIENCE = RULES.LEVEL_EXPERIENCE;
}