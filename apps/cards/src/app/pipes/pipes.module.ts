import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ModifierPipe} from "./modifier.pipe";
import {ValuePipe} from "./value.pipe";
import {DistancePipe} from "./distance.pipe";
import {TimePipe} from "./time.pipe";
import {TierPipe} from "./tier.pipe";
import {PacePipe} from "./pace.pipe";
import {ArraySortPipe} from "./sort.pipe";

const PIPES = [
	ModifierPipe,
    ValuePipe,
    DistancePipe,
    TimePipe,
    TierPipe,
    PacePipe,
    ArraySortPipe
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
