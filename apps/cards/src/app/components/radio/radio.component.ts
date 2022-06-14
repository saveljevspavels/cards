import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss']
})
export class RadioComponent implements OnInit {

  @Input()
  public fc: FormControl;

  @Input()
  public label: string;

  @Input()
  public name: string;

  @Input()
  public value: string;

  constructor() { }

  ngOnInit(): void {
  }

}
