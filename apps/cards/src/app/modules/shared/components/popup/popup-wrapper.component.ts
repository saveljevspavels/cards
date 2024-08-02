import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {PopupService} from "../../../../services/popup.service";
import {FormControl} from "@angular/forms";

@Component({
    selector: 'app-popup-wrapper',
    templateUrl: 'popup-wrapper.component.html'
})
export class PopupWrapperComponent implements OnInit {
    @Input() title: string;
    @Input() description: string;
    @Input() confirmText: string = 'Yes';
    @Input() cancelText: string = 'Cancel';
    @Input() showCancel: boolean = true;
    @Input() templateControl: FormControl;
    @Input() wide: boolean = false;
    @Input() disabled: boolean = false;
    @Output() onCancel = new EventEmitter;
    @Output() onConfirm = new EventEmitter;

    @ViewChild('templateRef', { static: true }) templateRef: ElementRef;

    constructor(private popupService: PopupService) {}

    ngOnInit() {
        if (this.templateRef) {
            this.templateControl.setValue(this.templateRef);
        }
    }

    cancel() {
        this.onCancel.emit();
        this.popupService.closePopup();
    }

    confirm() {
        this.onConfirm.emit();
        this.popupService.closePopup();
    }
}