import { Pipe, PipeTransform, Injectable } from '@angular/core';
import {TimePipe} from "./time.pipe";

@Injectable({
    providedIn: 'root'
})
@Pipe({name: 'pace'})
export class PacePipe implements PipeTransform {

    constructor(private timePipe: TimePipe) {
    }
    transform(value:any) {
        if (value) {
            const kmH = (value * 10000) * 36;
            if(value > 4.15) {
                return Math.floor(kmH / 10000) / 10 + ' km/h'
            }
            const secKm = Math.floor(1 / (kmH / (6000000 * 60)));
            return this.timePipe.transform(secKm) + ' min/km';
        }
        return value;
    }

}
