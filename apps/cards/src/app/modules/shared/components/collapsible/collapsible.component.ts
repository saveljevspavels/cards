import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {animate, state, style, transition, trigger} from "@angular/animations";
import {LocalStorageService} from "../../../../services/local-storage.service";
import {UtilService} from "../../../../services/util.service";

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
export class CollapsibleComponent implements OnInit {
    @Input() id: string;
    @Input() title: string = '';
    @Input() expanded = false;
    @Input() inclusive = false;
    @Input() customHeader = false;
    @Input() styleClass = '';

    @Output() public stateChange = new EventEmitter();

    constructor() { }

    ngOnInit(): void {
        if(this.id) {
            this.expanded = LocalStorageService.getState(this.id);
        }
    }

    toggle() {
        this.expanded = !this.expanded;
        this.stateChange.emit(this.expanded);
        if(this.id) {
            UtilService.saveState(this.expanded, this.id)
        }
    }
}
