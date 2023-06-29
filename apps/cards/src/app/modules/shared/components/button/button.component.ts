import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ButtonComponent implements OnInit {

    @Input() label: string;
    @Input() icon: string;
    @Input() disabled = false;
    @Input() type: string;
    @Input() transparent = false;
    @Input() styleClass = '';
    @Input() small = false;

    @Output() buttonClick = new EventEmitter()

    constructor() { }

    ngOnInit(): void {
    }

    click(event: Event) {
        if(!this.disabled) {
            this.buttonClick.emit(event)
        }
    }

}
