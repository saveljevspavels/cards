import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AngularFirestore} from "@angular/fire/firestore";
import {AdminService} from "../../admin.service";
import {FileService} from "../../../../services/file.service";

@Component({
  selector: 'app-card-create',
  templateUrl: './card-create.component.html',
  styleUrls: ['./card-create.component.scss']
})
export class CardCreateComponent implements OnInit, OnChanges {

    @Input()
    public selectedCardFactory: any;

    public tierAmount = new FormControl(5)
    public form = this.initForm()
    public imageControl = new FormControl([]);

    constructor(private formBuilder: FormBuilder,
                private adminService: AdminService,
                private fileService: FileService) { }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        if(changes.selectedCardFactory?.currentValue) {
            this.form.setValue(changes.selectedCardFactory.currentValue)
        }
    }

    get iterator() {
        return [...Array(this.tierAmount.value).keys()].map(val => val+1)
    }

    async submit() {
        const image = (await this.fileService.uploadImages(this.imageControl.value))[0]
        this.adminService.createCardFactory({
            ...this.form.value,
            image
        }).subscribe(() => {
            this.form = this.initForm()
        })
    }

    initForm() {
        const form = this.formBuilder.group({
            id: [''],
            title: ['', [Validators.required]],
            tiers: this.formBuilder.group({}),
            image: ['', [Validators.required]],
        })
        for(let i = 1; i <= this.tierAmount.value; i++) {
            (<FormGroup>form.get('tiers')).addControl(
                i.toString(),
                this.getTierGroup()
            )
        }
        // @ts-ignore
        form.get('tiers.1.description').valueChanges.subscribe(desc => {
            for(let i = 2; i <= this.tierAmount.value; i++) {
                // @ts-ignore
                this.form.get('tiers.' + i + '.description').setValue(desc)
            }
        })
        return form
    }

    getTierGroup(): FormGroup {
        return this.formBuilder.group({
            description: ['', [Validators.required]],
            modifier: ['0', [Validators.required]],
            value: ['0', [Validators.required]],
        })
    }
}
