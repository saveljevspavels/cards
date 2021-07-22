import {Component, forwardRef, Injector, Input, ViewChild} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl} from "@angular/forms";
import {FileUpload} from "primeng/fileupload";

@Component({
    selector: 'app-image-upload',
    templateUrl: './image-upload.component.html',
    styleUrls: ['./image-upload.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ImageUploadComponent),
        multi: true,
    }]
})
export class ImageUploadComponent implements ControlValueAccessor {

    @ViewChild('upload') upload: FileUpload;

    public imagesControl = new FormControl([])

    @Input()
    public multiple = true;

    constructor() {}
    ngOnInit() {}

    onSelect(event: any) {
        this.imagesControl.setValue(event.currentFiles)
        this._onChange(event.currentFiles)
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

}
