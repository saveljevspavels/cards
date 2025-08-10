import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    @Input() icon = '';
    @Input() title = '';
    @Input() backButton = false;

    @Output() backButtonClicked = new EventEmitter<void>();

    ngOnInit(): void {
    }
}
