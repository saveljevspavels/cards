import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
@Pipe({
    name: 'types',
})
export class ActivityTypePipe implements PipeTransform {
    transform(types: string): string {
        if(types) {
            return types.split(',').map(type => type.slice(0, 1).toUpperCase() + type.slice(1, type.length)).join(', ')
        } else {
            return '';
        }
    }
}
