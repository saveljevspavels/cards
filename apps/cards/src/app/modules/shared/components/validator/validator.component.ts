import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {Validator} from "../../../../interfaces/card";
import {ValidationService} from "../../../../services/validation.service";
import {BoardService} from "../../../../services/board.service";
import {filter, map, take} from "rxjs/operators";
import {AthleteService} from "../../../../services/athlete.service";
import {Observable} from "rxjs";
import {UtilService} from "../../../../services/util.service";
import {ConstService} from "../../../../services/const.service";

@Component({
    selector: 'app-validator',
    templateUrl: './validator.component.html',
    styleUrls: ['./validator.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ValidatorComponent implements OnInit {
    noSort = UtilService.noSort;
    public CONST = ConstService.CONST;

    @Input() validator: Validator;
    @Input() manual = false;
    @Input() activityTypes = '';
    public readableValidator: Observable<string>;
    public resolvedValues: Observable<any>;

    public typedValidator = false;

    public selectedActivity = this.boardService.selectedActivity$
    public activeValidator: Observable<{status: string, type: string}>;

    public icons = {
        neutral: 'pi-exclamation-circle'
    }

    public propertyNameMapping = new Map([
        [this.CONST.ACTIVITY_PROPERTIES.DISTANCE, 'distance'],
        [this.CONST.ACTIVITY_PROPERTIES.AVERAGE_SPEED, 'pace'],
        [this.CONST.ACTIVITY_PROPERTIES.MOVING_TIME, 'moving time'],
        [this.CONST.ACTIVITY_PROPERTIES.ELAPSED_TIME, 'total time'],
        [this.CONST.ACTIVITY_PROPERTIES.START_DATE, 'start time'],
        [this.CONST.ACTIVITY_PROPERTIES.ATHLETE_COUNT, 'number of athletes'],
        [this.CONST.ACTIVITY_PROPERTIES.ACHIEVEMENT_COUNT, 'number of achievements'],
        [this.CONST.ACTIVITY_PROPERTIES.TYPE, 'type'],
    ])

    constructor(private validationService: ValidationService,
                private boardService: BoardService,
                private athleteService: AthleteService) { }

    ngOnInit(): void {
        this.athleteService.me.pipe(filter(me => !!me && !this.manual), take(1)).subscribe((me) => {
            this.typedValidator = this.validator.property === this.CONST.ACTIVITY_PROPERTIES.DISTANCE || this.validator.property === this.CONST.ACTIVITY_PROPERTIES.AVERAGE_SPEED;

            this.readableValidator = this.athleteService.me.asObservable().pipe(map((_) =>
                `Activity ${this.propertyNameMapping.get(this.validator.property)}: ${this.comparatorToText()}`
            ))

            this.resolvedValues = this.athleteService.me.asObservable().pipe(map((_) =>
                Object.entries(this.resolveValues()).reduce((acc: any, entry) => {
                    if(!this.activityTypes || (this.activityTypes.indexOf(entry[0]) !== -1)) {
                        acc[entry[0]] = entry[1];
                    }
                    return acc;
                }, {})
            ))
            this.activeValidator = this.selectedActivity.pipe(map((activity: any) => {
                return {
                    status: !activity
                        ? 'neutral'
                        : this.validationService.validateRule(activity, this.validator)
                            ? 'pass'
                            : 'fail',
                    type: activity?.type ? UtilService.normalizeActivityType(activity?.type) : null
                }
            }))
        })
    }

    comparatorToText(): string {
        switch(this.validator.property) {
            case this.CONST.ACTIVITY_PROPERTIES.ELAPSED_TIME:
            case this.CONST.ACTIVITY_PROPERTIES.MOVING_TIME:
            case this.CONST.ACTIVITY_PROPERTIES.DISTANCE:
            case this.CONST.ACTIVITY_PROPERTIES.ATHLETE_COUNT:
            case this.CONST.ACTIVITY_PROPERTIES.ACHIEVEMENT_COUNT:
            case this.CONST.ACTIVITY_PROPERTIES.TYPE:
                switch(this.validator.comparator) {
                    case this.CONST.COMPARATORS.GREATER:
                        return 'at least';
                    case this.CONST.COMPARATORS.LESS:
                        return 'less than'
                    case this.CONST.COMPARATORS.EQUALS:
                        return 'exactly'
                    case this.CONST.COMPARATORS.IN:
                        return ''
                    case this.CONST.COMPARATORS.NOT_IN:
                        return 'any except'
                    default: return ''
                }
            case this.CONST.ACTIVITY_PROPERTIES.AVERAGE_SPEED: {
                switch(this.validator.comparator) {
                    case this.CONST.COMPARATORS.GREATER:
                        return 'at least';
                    case this.CONST.COMPARATORS.LESS:
                        return 'slower than'
                    case this.CONST.COMPARATORS.EQUALS:
                        return 'exactly'
                    default: return ''
                }
            }
            case this.CONST.ACTIVITY_PROPERTIES.START_DATE:
                switch(this.validator.comparator) {
                    case this.CONST.COMPARATORS.GREATER:
                        return 'after';
                    case this.CONST.COMPARATORS.LESS:
                        return 'before'
                    case this.CONST.COMPARATORS.EQUALS:
                        return 'exactly at'
                    default: return ''
                }
            default: return '';
        }
    }

    resolveValues(): string {
        return this.validationService.resolveValidationValue(this.validator)
    }

}
