import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-collapsible',
  templateUrl: './collapsible.component.html',
  styleUrls: ['./collapsible.component.scss']
})
export class CollapsibleComponent implements AfterViewInit {

    @Input() title: string = '';
    @Input() open = false;
    @Input() inclusive = false;
    @ViewChild('content', {static: true}) content: ElementRef;

    @Output() public stateChange = new EventEmitter();

    public initialized = false;
    public collapsed = false;
    public maxHeight = 0;

    constructor() { }

    ngAfterViewInit(): void {
    }

    toggle() {
        this.collapsed = !this.collapsed;
        this.stateChange.emit(!this.collapsed);
        this.onContentChange(null)
    }

    onContentChange(event: any) {
        const height = this.content.nativeElement.getBoundingClientRect().height;
        if(height) {
            this.maxHeight = height;
        }
        if(!this.initialized && this.maxHeight) {
            this.collapsed = !this.open;
            this.initialized = true;
        }
    }
}
