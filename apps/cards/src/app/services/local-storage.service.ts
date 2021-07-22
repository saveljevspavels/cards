import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  static get accessToken() {
    return (localStorage.getItem('access_token') || '').toString()
  }

  static get athlete() {
    return (JSON.parse(localStorage.getItem('athlete') || ''))
  }

  static get athleteId() {
    return (JSON.parse(localStorage.getItem('athlete') || '{}'))?.id?.toString()
  }
}
