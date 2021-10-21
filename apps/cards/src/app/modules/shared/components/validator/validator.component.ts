import {Component, Input, OnInit} from '@angular/core';
import {Validator} from "../../../../interfaces/card";
import {ValidationService} from "../../../../services/validation.service";
import {PacePipe} from "../../../../pipes/pace.pipe";
import {DistancePipe} from "../../../../pipes/distance.pipe";
import {TimePipe} from "../../../../pipes/time.pipe";

@Component({
    selector: 'app-validator',
    templateUrl: './validator.component.html',
    styleUrls: ['./validator.component.scss']
})
export class ValidatorComponent implements OnInit {

    @Input() validator: Validator
    public readableValidator: string;

    public propertyNameMapping = new Map([
        ['distance', 'distance'],
        ['average_speed', 'pace']
    ])

    constructor(private validationService: ValidationService,
                private pacePipe: PacePipe,
                private distancePipe: DistancePipe,
                private timePipe: TimePipe) { }

    ngOnInit(): void {
        this.readableValidator = `Activity ${this.propertyNameMapping.get(this.validator.property)} must be ${this.comparatorToText()} ${this.transformValue()}`
    }

    comparatorToText(): string {
        switch(this.validator.property) {
            case 'distance':
                switch(this.validator.comparator) {
                    case 'baseGreater':
                    case 'greater':
                        return 'at least';
                    case 'baseLess':
                    case 'less':
                        return 'not more than'
                    case 'equals':
                        return 'exactly'
                    default: return ''
                }
            case 'average_speed': {
                switch(this.validator.comparator) {
                    case 'baseGreater':
                    case 'greater':
                        return 'at least';
                    case 'baseLess':
                    case 'less':
                        return 'slower than'
                    case 'equals':
                        return 'exactly'
                    default: return ''
                }
            }
            default: return '';
        }

    }

    transformValue(): string {
        switch (this.validator.property) {
            case 'average_speed':
                return this.pacePipe.transform(this.validationService.resolveValidationValue(this.validator))
            case 'distance':
                return this.distancePipe.transform(this.validationService.resolveValidationValue(this.validator))
            default: return ''
        }
    }

}
