import {Component, Input} from '@angular/core';
import {PopupService} from "../../../../services/popup.service";
import {CompressionType, UploadedImage} from "../../../../../../../shared/interfaces/image-upload.interface";

@Component({
    selector: 'app-swiper',
    templateUrl: 'swiper.component.html',
    styleUrls: ['swiper.component.scss']
})
export class SwiperComponent {

    COMPRESSION_TYPE = CompressionType;
    @Input() images: UploadedImage[] = [];
    @Input() slideIndex = 0;
    @Input() polyline: string;
    @Input() activityType: string;

    constructor(private popupService: PopupService) {
    }

    next() {
        this.slideIndex = this.slideIndex >= (this.images.length - (this.polyline ? 0 : 1)) ? 0 : this.slideIndex + 1;
    }

    prev() {
        this.slideIndex = this.slideIndex <= 0 ? (this.images.length - (this.polyline ? 0 : 1)) : this.slideIndex - 1;
    }

    close() {
        this.popupService.closePopup();
    }

}
