import {Component, Input, OnInit} from '@angular/core';
import {Validator} from "../../../../interfaces/card";
import {ValidationService} from "../../../../services/validation.service";
import {PacePipe} from "../../../../pipes/pace.pipe";
import {DistancePipe} from "../../../../pipes/distance.pipe";
import {TimePipe} from "../../../../pipes/time.pipe";
import {CONST} from "../../../../app.module";
import {BoardService} from "../../../../services/board.service";
import {map} from "rxjs/operators";

@Component({
    selector: 'app-validator',
    templateUrl: './validator.component.html',
    styleUrls: ['./validator.component.scss']
})
export class ValidatorComponent implements OnInit {

    @Input() validator: Validator
    public readableValidator: string;

    public selectedActivity = this.boardService.selectedActivity$
    public validatorStatus = this.selectedActivity.pipe(map((activity) =>
            !activity
                ? 'neutral'
                : this.validationService.validateRule(activity, this.validator)
                    ? 'pass'
                    : 'fail'
    ))

    public propertyNameMapping = new Map([
        [CONST.ACTIVITY_PROPERTIES.DISTANCE, 'distance'],
        [CONST.ACTIVITY_PROPERTIES.AVERAGE_SPEED, 'pace'],
        [CONST.ACTIVITY_PROPERTIES.MOVING_TIME, 'moving time'],
        [CONST.ACTIVITY_PROPERTIES.ELAPSED_TIME, 'total time'],
        [CONST.ACTIVITY_PROPERTIES.START_DATE, 'start time'],
        [CONST.ACTIVITY_PROPERTIES.ATHLETE_COUNT, 'number of athletes'],
        [CONST.ACTIVITY_PROPERTIES.ACHIEVEMENT_COUNT, 'number of achievements'],
        [CONST.ACTIVITY_PROPERTIES.TYPE, 'type'],
    ])

    constructor(private validationService: ValidationService,
                private pacePipe: PacePipe,
                private distancePipe: DistancePipe,
                private timePipe: TimePipe,
                private boardService: BoardService) { }

    ngOnInit(): void {
        this.readableValidator = `Activity ${this.propertyNameMapping.get(this.validator.property)} must be ${this.comparatorToText()} ${this.transformValue()}`
    }

    comparatorToText(): string {
        switch(this.validator.property) {
            case CONST.ACTIVITY_PROPERTIES.ELAPSED_TIME:
            case CONST.ACTIVITY_PROPERTIES.MOVING_TIME:
            case CONST.ACTIVITY_PROPERTIES.DISTANCE:
            case CONST.ACTIVITY_PROPERTIES.ATHLETE_COUNT:
            case CONST.ACTIVITY_PROPERTIES.ACHIEVEMENT_COUNT:
            case CONST.ACTIVITY_PROPERTIES.TYPE:
                switch(this.validator.comparator) {
                    case CONST.COMPARATORS.GREATER:
                        return 'at least';
                    case CONST.COMPARATORS.LESS:
                        return 'not more than'
                    case CONST.COMPARATORS.EQUALS:
                        return 'exactly'
                    case CONST.COMPARATORS.IN:
                        return 'must be either'
                    case CONST.COMPARATORS.NOT_IN:
                        return 'must be neither'
                    default: return ''
                }
            case CONST.ACTIVITY_PROPERTIES.AVERAGE_SPEED: {
                switch(this.validator.comparator) {
                    case CONST.COMPARATORS.GREATER:
                        return 'at least';
                    case CONST.COMPARATORS.LESS:
                        return 'slower than'
                    case CONST.COMPARATORS.EQUALS:
                        return 'exactly'
                    default: return ''
                }
            }
            case CONST.ACTIVITY_PROPERTIES.START_DATE:
                switch(this.validator.comparator) {
                    case CONST.COMPARATORS.GREATER:
                        return 'after';
                    case CONST.COMPARATORS.LESS:
                        return 'before'
                    case CONST.COMPARATORS.EQUALS:
                        return 'exactly at'
                    default: return ''
                }
            default: return '';
        }
    }

    transformValue(): string {
        switch (this.validator.property) {
            case CONST.ACTIVITY_PROPERTIES.AVERAGE_SPEED:
                return this.pacePipe.transform(this.validationService.resolveValidationValue(this.validator))
            case CONST.ACTIVITY_PROPERTIES.DISTANCE:
                return this.distancePipe.transform(this.validationService.resolveValidationValue(this.validator))
            case CONST.ACTIVITY_PROPERTIES.ELAPSED_TIME:
            case CONST.ACTIVITY_PROPERTIES.MOVING_TIME:
            case CONST.ACTIVITY_PROPERTIES.START_DATE:
                return this.timePipe.transform(<number>this.validationService.resolveValidationValue(this.validator))
            case CONST.ACTIVITY_PROPERTIES.ATHLETE_COUNT:
            case CONST.ACTIVITY_PROPERTIES.ACHIEVEMENT_COUNT:
            default: return this.validator.formula.toString()
        }
    }

}
