import {Component, Input} from "@angular/core";

@Component({
    selector: 'app-stat-display',
    templateUrl: './stat-display.component.html',
    styleUrls: ['./stat-display.component.scss']
})
export class StatDisplayComponent {
    @Input() title: string;
    @Input() value: number;
    @Input() limit: number = 0;
    @Input() hasUpdates: boolean = false;
}