import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Injectable()
@Pipe({name: 'tier'})
export class TierPipe implements PipeTransform {

  transform(value:any) {
    if(value < 125) return 0
    if(value >= 125 && value < 150) return 1
    if(value >= 150 && value < 200) return 2
    if(value >= 200 && value < 250) return 3
    if(value >= 250) return 4
    return 0;
  }

}
