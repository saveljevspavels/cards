import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Injectable()
@Pipe({name: 'value'})
export class ValuePipe implements PipeTransform {

  transform(value:any) {
    if (value) {
      return `+ ${value} points`;
    }
    return value;
  }

}
