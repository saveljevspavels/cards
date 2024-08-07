import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
@Pipe({name: 'distance'})
export class DistancePipe implements PipeTransform {

  transform(value:any, showUnits = true) {
    if (value || value === 0) {
      const kilometers = parseInt(value)/1000;
      return (Number.isInteger(kilometers) ? kilometers : kilometers.toFixed(1)) + (showUnits ? 'km' : '');
    }
    return value;
  }

}
