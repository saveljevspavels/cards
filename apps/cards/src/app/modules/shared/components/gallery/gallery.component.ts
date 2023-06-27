import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {PopupService} from "../../../../services/popup.service";

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

  @Input() public images: string[];
  @ViewChild('gallery', { static: true }) gallery: ElementRef;
  public slideIndex = 0;

  constructor(private popupService: PopupService) { }

  ngOnInit(): void {
  }

  openGallery(index: number) {
    this.slideIndex = index
    this.popupService.showPopup(this.gallery)
  }

}
