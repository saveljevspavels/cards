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

        array.sort((a: any, b: any) => {
            const valA = options?.type === 'date' ? new Date(this.getProperty(a, path)) : this.getProperty(a, path);
            const valB = options?.type === 'date' ? new Date(this.getProperty(b, path)) : this.getProperty(b, path);
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
