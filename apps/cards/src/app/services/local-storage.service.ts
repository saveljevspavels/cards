import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    static get accessToken() {
        return (localStorage.getItem('access_token') || '').toString()
    }

    static get athlete() {
        const stored = (JSON.parse(localStorage.getItem('athlete') || '{}'));
        return Object.keys(stored).length ? stored : null
    }

    static get athleteId() {
        return (JSON.parse(localStorage.getItem('athlete') || '{}'))?.id?.toString()
    }

    static setObject(data: any) {
        Object.keys(data).forEach(key => {
            localStorage.setItem(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key])
        })
    }

    static getState(item: string) {
        return (JSON.parse(localStorage.getItem(item) || 'true'))
    }

    static getValue(item: string) {
        return localStorage.getItem(item)
    }
}
