import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {

    readonly ButtonType = ButtonType;

    @Input() label: string;
    @Input() icon: string;
    @Input() disabled = false;
    @Input() loading = false;
    @Input() type: ButtonType;
    @Input() transparent = false;
    @Input() styleClass = '';
    @Input() small = false;
    @Input() fixedWidth = false;

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

export enum ButtonType {
    REGULAR = 'regular',
    DANGER = 'danger',
    DANGER_FILLED = 'danger-filled',
    DANGER_FILLED_DARK = 'danger-filled-dark',
    SUCCESS = 'success',
    ACTION = 'action',
    FILLED = 'filled',
}