import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss']
})
export class TextareaComponent implements OnInit {

  @Input()
  public rows = 7;

  @Input()
  public fc: FormControl;

  @Input()
  public label: string;

  constructor() { }

  ngOnInit(): void {
  }

}
