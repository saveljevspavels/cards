import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-tier-badge',
  templateUrl: './tier-badge.component.html',
  styleUrls: ['./tier-badge.component.scss']
})
export class TierBadgeComponent implements OnInit {

    @Input() tier: number;
    @Input() label: string;

    constructor() { }

    ngOnInit(): void {
    }

}
