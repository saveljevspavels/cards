import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Injectable()
@Pipe({name: 'modifier'})
export class ModifierPipe implements PipeTransform {

  transform(value:any) {
    if (value) {
      return `+ ${value}%`;
    }
    return value;
  }

}
