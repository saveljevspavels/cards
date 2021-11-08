import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-collapsible',
  templateUrl: './collapsible.component.html',
  styleUrls: ['./collapsible.component.scss']
})
export class CollapsibleComponent implements OnInit {

    @Input() title: string = '';
    @Input() open = false;
    @Input() inclusive = false;
    @ViewChild('content', {static: true}) content: ElementRef;

    public collapsed = false;
    public maxHeight = 0;

    constructor() { }

    ngOnInit(): void {
    }

    toggle() {
        this.collapsed = !this.collapsed;
    }

    onContentChange(event: any) {
        this.maxHeight = this.content.nativeElement.getBoundingClientRect().height;
        console.log('maxHeight', this.maxHeight)
    }
}
