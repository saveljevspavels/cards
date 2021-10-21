import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
@Pipe({name: 'distance'})
export class DistancePipe implements PipeTransform {

  transform(value:any) {
    if (value) {
      return parseInt(value)/1000 + ' km';
    }
    return value;
  }

}
