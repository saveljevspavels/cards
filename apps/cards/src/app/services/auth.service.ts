import { Injectable } from '@angular/core';
import {
  REQUIRED_PERMISSIONS,
} from "../constants/constants";
import {HttpClient, HttpParams} from "@angular/common/http";
import {filter, tap} from "rxjs/operators";
import {Router} from "@angular/router";
import {CONST, STRAVA_CONFIG} from "../app.module";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  responseParams: any;

  constructor(private httpClient: HttpClient,
              private router: Router) {
  }

  authorize(clientId: string, returnUrl: string, requiredPermissions: string) {
    window.location.href = `http://${CONST.STRAVA_BASE}/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${returnUrl}?exchange_token&approval_prompt=force&scope=${requiredPermissions}`
  }

  getToken(code: string) {
    let params = new HttpParams();
    params = params.append('client_id', STRAVA_CONFIG.STRAVA_CLIENT_ID);
    params = params.append('client_secret', STRAVA_CONFIG.STRAVA_CLIENT_SECRET);
    params = params.append('code', code);
    params = params.append('grant_type', 'authorization_code');

    return this.getAuthRequest(params)
  }

  refreshToken(refreshToken: string) {
    let params = new HttpParams();
    params = params.append('client_id', STRAVA_CONFIG.STRAVA_CLIENT_ID);
    params = params.append('client_secret', STRAVA_CONFIG.STRAVA_CLIENT_SECRET);
    params = params.append('refresh_token', refreshToken);
    params = params.append('grant_type', 'refresh_token');

    return this.getAuthRequest(params)
  }

  private getAuthRequest(params: HttpParams) {
    return this.httpClient.post('https://' + CONST.STRAVA_BASE + '/oauth/token', null, { params })
      .pipe(tap(async (res: any) => {
        if(res.athlete) {
          await this.storeAthlete(res.athlete)
        }
        Object.keys(res).forEach(key => {
          localStorage.setItem(key, typeof res[key] === 'object' ? JSON.stringify(res[key]) : res[key])
        })
      }))
  }

  async storeAthlete(athlete: any) {
      return this.httpClient.post(`${environment.baseBE}/save-athlete`, {
        athlete
      }).subscribe()
  }

  login() {
    this.authorize(STRAVA_CONFIG.STRAVA_CLIENT_ID, environment.authReturnUrl, REQUIRED_PERMISSIONS);
  }

  logout() {
    localStorage.clear()
    this.router.navigateByUrl('/login')
  }
}
