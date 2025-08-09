import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit {

  @Input() public src: string;
  @Input() public index: string;
  @Input() public small = false;

  constructor() { }

  ngOnInit(): void {
  }

}
