import {Component, ElementRef, forwardRef, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {PopupService} from "../../../../services/popup.service";
import {UtilService} from "../../../../services/util.service";
import {ConstService} from "../../../../services/const.service";

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
    public CONST = ConstService.CONST;

    @ViewChild('gallery', { static: true }) gallery: ElementRef;
    public slideIndex = 0;

    public selectedCards = new FormControl([])
    public imageObservables: any;
    public activityType = '';

    @Input() public activity: any;
    @Input() public selection = false;
    @Input() public showImages = true;
    @Input() public showComments = false;
    @Input() public showAthlete = false;
    @Input() public collapsible = false;

    constructor(private popupService: PopupService) { }

    async ngOnInit() {
        this.selectedCards.valueChanges.subscribe((value) => {
            this._onChange(value)
        })
        this.activityType = UtilService.normalizeActivityType(this.activity.type);
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
