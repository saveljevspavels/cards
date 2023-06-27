import { Pipe, PipeTransform, Injectable } from '@angular/core';
import {CONST} from "../../../../../definitions/constants";
import {DistancePipe} from "./distance.pipe";
import {PacePipe} from "./pace.pipe";
import {MinutesPipe} from "./minutes.pipe";

@Injectable({
    providedIn: 'root'
})
@Pipe({name: 'activityProp'})
export class ActivityPropPipe implements PipeTransform {

  constructor(
      private distancePipe: DistancePipe,
      private minutesPipe: MinutesPipe,
      private pacePipe: PacePipe,
  ) {}

  transform(value:any, property: string) {
    switch (property) {
      case (CONST.ACTIVITY_PROPERTIES.DISTANCE): return this.distancePipe.transform(value);
      case (CONST.ACTIVITY_PROPERTIES.ELAPSED_TIME): return this.minutesPipe.transform(value);
      case (CONST.ACTIVITY_PROPERTIES.MOVING_TIME): return this.minutesPipe.transform(value);
      case (CONST.ACTIVITY_PROPERTIES.AVERAGE_SPEED): return this.pacePipe.transform(value);
    }
  }

}
