import {Component, Input} from '@angular/core';
import {PopupService} from "../../../../services/popup.service";
import {CompressionType, UploadedImage} from "../../../../../../../shared/interfaces/image-upload.interface";

@Component({
    selector: 'app-swiper',
    templateUrl: 'swiper.component.html',
    styleUrls: ['swiper.component.scss']
})
export class SwiperComponent {

    private swipeCoord?: [number, number];
    private swipeTime?: number;

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

    swipe(e: TouchEvent, when: string): void {
        const coord: [number, number] = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
        const time = new Date().getTime();

        if (when === 'start') {
            this.swipeCoord = coord;
            this.swipeTime = time;
        } else if (when === 'end') {
            const direction = [coord[0] - this.swipeCoord![0], coord[1] - this.swipeCoord![1]];
            const duration = time - this.swipeTime!;

            if (duration < 1000 //
                && Math.abs(direction[0]) > 30 // Long enough
                && Math.abs(direction[0]) > Math.abs(direction[1] * 3)) { // Horizontal enough
                if(direction[0] < 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        }
    }

}
