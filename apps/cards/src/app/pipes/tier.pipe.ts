import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Injectable()
@Pipe({name: 'tier'})
export class TierPipe implements PipeTransform {

  transform(value:any) {
    if(value < 4) return 0
    if(value >= 4 && value < 5) return 1
    if(value >= 6 && value < 7) return 2
    if(value >= 8) return 3
    return 0;
  }

}
