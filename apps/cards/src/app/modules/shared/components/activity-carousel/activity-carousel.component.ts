import {Component, Input, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'app-activity-carousel',
    templateUrl: './activity-carousel.component.html',
    styleUrl: './activity-carousel.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class ActivityCarouselComponent {
    @Input() items: any[] = [];
}
