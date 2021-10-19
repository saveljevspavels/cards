import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
@Pipe({
  name: 'time',
})
export class TimePipe implements PipeTransform {
  transform(millis: number): string {
    const totalSeconds = Math.floor(millis);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600)
    return `${hours ? hours + ':' : ''}${('0' + minutes).slice(-2)}:${('0' + seconds).slice(-2)}`
  }
}
