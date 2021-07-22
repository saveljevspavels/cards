import {Component, forwardRef, Input, OnChanges, OnInit, SimpleChanges, TemplateRef} from '@angular/core';
import {ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
  selector: 'app-selection-wrapper',
  templateUrl: './selection-wrapper.component.html',
  styleUrls: ['./selection-wrapper.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectionWrapperComponent),
    multi: true,
  }]
})
export class SelectionWrapperComponent implements OnInit, OnChanges, ControlValueAccessor {

  @Input()
  dataItems: any[]

  @Input()
  wrap = false;

  @Input()
  template: TemplateRef<any>;

  @Input()
  selectionEnabled = true;

  public innerForm: FormGroup;
  public selectAll = this.formBuilder.control(false)

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(this.dataItems?.length) {
      this.innerForm = this.formBuilder.group({})
      this.dataItems.forEach((item: any) => {
        this.innerForm.addControl(typeof item === 'string' ? item : item.id, this.formBuilder.control(false))
      })
      this.innerForm.valueChanges.subscribe((values: any) => {
        const res = Object.keys(values).filter(key => values[key])
        this._onChange(res)
      })

      this.selectAll.valueChanges.subscribe((value: any) => {
        this.dataItems.forEach((item: any) => {
          this.innerForm.get(typeof item === 'string' ? item : item.id.toString())?.setValue(value)
        })
      })
    }
  }

  _onChange: any = () => {};
  _onTouched: any = () => {};

  writeValue(value: any) {
      if(this.innerForm) {
          const formValue = this.innerForm.value;
          Object.keys(formValue).forEach(key => {
              if(formValue.hasOwnProperty(key)) {
                  formValue[key] = value.indexOf(key) !== -1
              }
          })
          this.innerForm.patchValue(formValue)
      }
  }

  registerOnChange(fn: any) {
    this._onChange = fn;
  }

  registerOnTouched(fn: any) {
    this._onTouched = fn;
  }

}
