import { Pipe, PipeTransform, Injectable } from '@angular/core';
import {UtilService} from "../services/util.service";

@Injectable()
@Pipe({name: 'tier'})
export class TierPipe implements PipeTransform {

  transform(value:any) {
    return UtilService.getTier(value)
  }

}
