import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
@Pipe({name: 'roman'})
export class RomanPipe implements PipeTransform {

  transform(value: number) {
    switch (value) {
      case 0: return '';
      case 1: return 'I';
      case 2: return 'II';
      case 3: return 'III';
      case 4: return 'IV';
      case 5: return 'V';
      case 6: return 'VI';
      case 7: return 'VII';
      case 8: return 'VIII';
      case 9: return 'IX';
      case 10: return 'X';
        default: return ''
    }
  }

}
