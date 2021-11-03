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

    static get rulesHidden(): boolean {
        return (JSON.parse(localStorage.getItem('rulesHidden') || 'false'))
    }

    static set rulesHidden(value: boolean) {
        localStorage.setItem('rulesHidden', value.toString())
    }
}
