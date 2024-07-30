import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
@Pipe({
  name: 'minutes',
})
export class MinutesPipe implements PipeTransform {
  transform(millis: any, showUnits = true): string {
    const totalSeconds = Math.floor(millis);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes}${showUnits ? 'min' : ''}`
  }
}
