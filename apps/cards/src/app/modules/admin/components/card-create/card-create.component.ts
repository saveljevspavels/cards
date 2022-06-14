import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AdminService} from "../../admin.service";
import {FileService} from "../../../../services/file.service";
import {UtilService} from "../../../../services/util.service";
import {ConstService} from "../../../../services/const.service";

@Component({
  selector: 'app-card-create',
  templateUrl: './card-create.component.html',
  styleUrls: ['./card-create.component.scss']
})
export class CardCreateComponent implements OnInit, OnChanges {
    public workoutProperties = UtilService.getFlatKeys(ConstService.RULES.DEFAULT_BASE_WORKOUT)
    public CONST = ConstService.CONST

    @Input()
    public selectedCardFactory: any;

    public cardAmount = new FormControl(4, [Validators.min(1)])
    public validatorAmount = new FormControl(0, [Validators.min(0)])
    public form: FormGroup;
    public imageControl = new FormControl([]);

    constructor(private formBuilder: FormBuilder,
                private adminService: AdminService,
                private fileService: FileService) { }

    ngOnInit(): void {
        this.form = this.initForm()
        this.cardAmount.valueChanges.subscribe((amount) => {
            this.updateFormCardAmount(this.form, amount)
        })
        this.validatorAmount.valueChanges.subscribe((amount) => {
            this.updateValidatorAmount(this.form, amount)
        })
    }

    ngOnChanges(changes: SimpleChanges) {
        const factory = changes.selectedCardFactory?.currentValue;
        if(factory) {
            this.validatorAmount.setValue(Object.keys(factory.cards[0]?.validators).length);
            this.cardAmount.setValue(Object.keys(factory.cards).length);
            setTimeout(() => this.form.patchValue(changes.selectedCardFactory.currentValue))
        }
    }

    get cardAmountIterator() {
        return [...Array(parseInt(this.cardAmount.value, 10)).keys()]
    }

    get validatorAmountIterator() {
        return [...Array(parseInt(this.validatorAmount.value, 10)).keys()]
    }

    async submit() {
        const image = this.imageControl.value.length ? (await this.fileService.uploadImages(this.imageControl.value))[0] : this.selectedCardFactory?.image;
        this.adminService.createCardFactory({
            ...this.form.value,
            image: image ? image : null
        }).subscribe(() => {
            this.form = this.initForm()
        })
    }

    initForm() {
        const form = this.formBuilder.group({
            id: [''],
            title: ['', [Validators.required]],
            image: ['', [Validators.required]],
            manualValidation: [false],
            progression: ['']
        })
        this.updateFormCardAmount(form, this.cardAmount.value)
        form.get('progression')?.valueChanges.subscribe(progression => {
            switch (progression) {
                case ConstService.CONST.PROGRESSION.TIERS:
                case ConstService.CONST.PROGRESSION.CHAIN:
                    for(let i = 0; i < this.cardAmount.value; i++) {
                        this.form.get('cards.' + i + '.tier')?.setValue(i)
                    }
                    break;
                case ConstService.CONST.PROGRESSION.FLAT:
                    for(let i = 0; i < this.cardAmount.value; i++) {
                        this.form.get('cards.' + i + '.tier')?.setValue(0)
                    }
                    break;
                case ConstService.CONST.PROGRESSION.NONE:
                    this.form.get('cards.0.tier')?.setValue(0)
                    this.cardAmount.setValue(1);
                    break;
            }
        })
        return form
    }

    getCardGroup(): FormGroup {
        const cardGroup = this.formBuilder.group({
            description: ['', [Validators.required]],
            tier: ['0', [Validators.required]],
            usesToProgress: ['0', [Validators.required]],
            value: ['0', [Validators.required]],
        })
        this.setValidatorsToCardGroup(cardGroup, this.validatorAmount.value)
        return cardGroup;
    }

    getValidatorGroup(): FormGroup {
        return this.formBuilder.group({
            property: ['', [Validators.required]],
            comparator: [''],
            formula: ['0', [Validators.required]],
        })
    }

    updateFormCardAmount(form: FormGroup, amount: number) {
        const currentAmount = Object.keys((<FormGroup>form.get('cards'))?.controls || {}).length;
        if(currentAmount > amount) {
            for(let i = amount; i < currentAmount; i++) {
                (<FormGroup>form.get('cards')).removeControl(
                    i.toString()
                )
            }
        } else if (currentAmount < amount) {
            if(currentAmount === 0) {
                form.setControl('cards', this.formBuilder.group({}))
            }
            for(let i = currentAmount; i < amount; i++) {
                (<FormGroup>form.get('cards')).addControl(
                    i.toString(),
                    this.getCardGroup()
                )
            }
        }
    }

    updateValidatorAmount(form: FormGroup, amount: number) {
        for(let card = 0; card < this.cardAmount.value; card++) {
            const cardGroup = (<FormGroup>form.get('cards.' + card));
            this.setValidatorsToCardGroup(cardGroup, amount)
        }
    }

    setValidatorsToCardGroup(cardGroup: FormGroup, amount: number) {
        const currentAmount = Object.keys((<FormGroup>cardGroup.get('validators'))?.controls || {}).length;
        if(currentAmount > amount) {
            for(let i = amount; i < currentAmount; i++) {
                (<FormGroup>cardGroup.get('validators')).removeControl(
                    i.toString()
                )
            }
        } else if (currentAmount < amount) {
            if(currentAmount === 0) {
                cardGroup.setControl('validators', this.formBuilder.group({}));
            }
            for(let validator = currentAmount; validator < amount; validator++) {
                (<FormGroup>cardGroup.get('validators')).addControl(
                    validator.toString(),
                    this.getValidatorGroup()
                )
            }
        }
    }

    copyCards(cardValue: any) {
        for(let i = 0; i < this.cardAmount.value; i++) {
            this.form.get('cards.' + i)?.setValue(cardValue)
        }
    }
}
