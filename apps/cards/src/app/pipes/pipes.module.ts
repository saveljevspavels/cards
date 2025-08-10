import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ModifierPipe} from "./modifier.pipe";
import {ValuePipe} from "./value.pipe";
import {DistancePipe} from "./distance.pipe";
import {TimePipe} from "./time.pipe";
import {TierPipe} from "./tier.pipe";
import {PacePipe} from "./pace.pipe";
import {ArraySortPipe} from "./sort.pipe";
import {ActivityTypePipe} from "./activity-type.pipe";
import {PercentPipe} from "./percent.pipe";
import {MinutesPipe} from "./minutes.pipe";
import {ActivityPropPipe} from "./activity-prop.pipe";
import {RomanPipe} from "./roman.pipe";
import { TimeAgoPipe } from './time-ago.pipe';

const PIPES = [
	ModifierPipe,
    ValuePipe,
    DistancePipe,
    TimePipe,
    TierPipe,
    PacePipe,
    ArraySortPipe,
    ActivityTypePipe,
    PercentPipe,
    MinutesPipe,
    ActivityPropPipe,
    RomanPipe,
    TimeAgoPipe
]

@NgModule({
    imports: [
        CommonModule
	],
	declarations: [
		...PIPES
    ],
    exports: [
		...PIPES
    ]
})
export class PipesModule { }
