import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeAgo',
    pure: false // allows updates without manual refresh
})
export class TimeAgoPipe implements PipeTransform {
    transform(value: Date | string | number): string {
        if (!value) return '';

        const now = Date.now();
        const date = new Date(value).getTime();
        const diffMs = now - date;
        const seconds = Math.floor(diffMs / 1000);

        if (seconds < 5) return 'just now';
        if (seconds < 60) return `${seconds} seconds ago`;

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}
