import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
@Pipe({name: 'percent'})
export class PercentPipe implements PipeTransform {

    constructor() {
    }
    transform(value:any) {
        if (value || value === 0) {
            return Math.floor(parseInt(value)/10) + '%';
        }
        return value;
    }

}
