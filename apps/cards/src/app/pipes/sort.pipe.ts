import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "sort"
})
export class ArraySortPipe  implements PipeTransform {
    transform(
        array: any,
        path: string,
        options?: {
            order?: 'asc' | 'desc',
            type?: 'number' | 'string' | 'date'
        }
    ): any[] {
        if (!Array.isArray(array)) {
            return array;
        }

        options = {
            order: 'asc',
            type: 'number',
            ...options
        }

        array = array.sort((a: any, b: any) => {
            let valA = this.getProperty(a, path);
            let valB = this.getProperty(b, path);
            switch (options?.type) {
                case 'date':
                    valA = new Date(valA);
                    valB = new Date(valB);
                    break;
                case 'number':
                    valA = valA || 0;
                    valB = valB || 0;
                    break;
            }
            if (valA < valB) {
                return options?.order === 'asc' ? -1 : 1;
            } else if (valA > valB) {
                return options?.order === 'asc' ? 1 : -1;
            } else {
                return 0;
            }
        });
        return array;
    }

    getProperty(value: any, path: string) {
        return path.split('.').reduce((p,c)=>p&&p[c]||null, value);
    }
}
