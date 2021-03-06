import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit {

  @Input()
  public fc: FormControl;

  @Input()
  public label: string;

  @Input()
  public options: Option[]

  constructor() { }

  ngOnInit(): void {
  }

}

export interface Option {
    key: string,
    value: any
}
