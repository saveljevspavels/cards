import {Component, ElementRef, forwardRef, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {FileService} from "../../../../services/file.service";
import {PopupService} from "../../../../services/popup.service";
import {CONST} from "../../../../app.module";

@Component({
    selector: 'app-activity',
    templateUrl: './activity.component.html',
    styleUrls: ['./activity.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ActivityComponent),
        multi: true,
    }],
    encapsulation: ViewEncapsulation.None
})
export class ActivityComponent implements OnInit, ControlValueAccessor {
    public CONST = CONST;

    @ViewChild('gallery', { static: true }) gallery: ElementRef;
    public slideIndex = 0;

    public selectedCards = new FormControl([])
    public imageObservables: any;

    @Input() public activity: any;
    @Input() public selection = false;
    @Input() public showImages = true;
    @Input() public showComments = false;
    @Input() public showAthlete = false;

    constructor(private popupService: PopupService) { }

    async ngOnInit() {
        this.selectedCards.valueChanges.subscribe((value) => {
            this._onChange(value)
        })
    }

    _onChange: any = () => {};
    _onTouched: any = () => {};

    writeValue(value: any) {}

    registerOnChange(fn: any) {
        this._onChange = fn;
    }

    registerOnTouched(fn: any) {
        this._onTouched = fn;
    }

    openGallery(index: number) {
        this.slideIndex = index
        this.popupService.showPopup(this.gallery)
    }

}
