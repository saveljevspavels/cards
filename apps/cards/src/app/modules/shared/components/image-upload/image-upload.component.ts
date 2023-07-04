import {Component, ElementRef, forwardRef, Input, OnDestroy, ViewChild, ViewEncapsulation} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {FileUpload} from "primeng/fileupload";
import {Subject, Subscription} from "rxjs";

@Component({
    selector: 'app-image-upload',
    templateUrl: './image-upload.component.html',
    styleUrls: ['./image-upload.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ImageUploadComponent),
        multi: true,
    }],
    encapsulation: ViewEncapsulation.None
})
export class ImageUploadComponent implements ControlValueAccessor, OnDestroy {

    @ViewChild('upload') upload: FileUpload;
    @ViewChild('wrapper') wrapper: ElementRef;

    public imagesControl = new FormControl([])

    @Input()
    public multiple = true;

    @Input() public uploadTrigger: Subject<any>;
    private triggerSubscription: Subscription;

    constructor() {}
    ngOnInit() {
        this.initUploadTrigger();
    }

    onSelect(event: any) {
        this.imagesControl.setValue(event.currentFiles)
        this._onChange(event.currentFiles)
    }

    initUploadTrigger() {
        if(!this.uploadTrigger) {
            return;
        }
        this.triggerSubscription = this.uploadTrigger.subscribe(_ => {
            this.wrapper.nativeElement.querySelector('input').click();
        })
    }

    _onChange: any = () => {};
    _onTouched: any = () => {};

    writeValue(value: any) {
        if(!value || value.length === 0) {
            this.imagesControl.setValue([])
            this.upload?.clear()
        }
    }

    registerOnChange(fn: any) {
        this._onChange = fn;
    }

    registerOnTouched(fn: any) {
        this._onTouched = fn;
    }

    ngOnDestroy() {
        this.triggerSubscription.unsubscribe();
    }
}
