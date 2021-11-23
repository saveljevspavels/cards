import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
    selector: 'app-collapsible',
    templateUrl: './collapsible.component.html',
    styleUrls: ['./collapsible.component.scss'],
    animations: [
        trigger('collapse', [
            state('expanded', style({
                height: '*',
            })),
            state('collapsed', style({
                height: '{{startHeight}}',
            }),{
                params: {startHeight: '0px'}
            }),
            transition('expanded => collapsed', animate('200ms ease-in-out')),
            transition('collapsed => expanded', animate('200ms ease-in-out'))
        ])
    ]
})
export class CollapsibleComponent implements AfterViewInit {

    @Input() title: string = '';
    @Input() expanded = false;
    @Input() inclusive = false;
    @Input() customHeader = false;

    @Output() public stateChange = new EventEmitter();

    constructor() { }

    ngAfterViewInit(): void {
    }

    toggle() {
        this.expanded = !this.expanded;
        this.stateChange.emit(this.expanded);
    }
}
