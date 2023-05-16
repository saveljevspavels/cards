import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    static get accessToken() {
        return (localStorage.getItem('access_token') || '').toString()
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

    static get jwt(): string {
        return (localStorage.getItem('jwt') || '');
    }

    static set jwt(id: string) {
        localStorage.setItem('jwt', id);
    }
}
