import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {CONST} from "../../app.module";

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss']
})
export class TextareaComponent implements OnInit {

    @Input()
    public rows = 7;

    @Input()
    public maxLength = CONST.COMMENT_LENGTH;

    @Input()
    public fc: FormControl;

    @Input()
    public styleClass: string;

    @Input()
    public label: string;

    constructor() { }

    ngOnInit(): void {
    }

}
