import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {

    @Input() label: string;
    @Input() icon: string;
    @Input() disabled = false;
    @Input() type: string;
    @Input() styleClass = '';

    constructor() { }

    ngOnInit(): void {
    }

}
