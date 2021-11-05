import {Component, Input, OnInit} from '@angular/core';
import {LogItem} from "../../../../interfaces/log-item";

@Component({
  selector: 'app-log-item',
  templateUrl: './log-item.component.html',
  styleUrls: ['./log-item.component.scss']
})
export class LogItemComponent implements OnInit {

    @Input() item: LogItem;

    constructor() { }

    ngOnInit(): void {
    }

}
