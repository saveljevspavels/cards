import { Injectable } from '@angular/core';
import {
  REQUIRED_PERMISSIONS,
} from "../constants/constants";
import {HttpClient, HttpParams} from "@angular/common/http";
import {filter, tap} from "rxjs/operators";
import {Router} from "@angular/router";
import {environment} from "../../environments/environment";
import {LocalStorageService} from "./local-storage.service";
import sampleUser from "../../../../../definitions/sampleUser.json"
import {BehaviorSubject} from "rxjs";
import {ConstService} from "./const.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  responseParams: any;
  loggedIn = new BehaviorSubject<boolean>(false);

  constructor(private httpClient: HttpClient,
              private router: Router) {
  }

  authorize(clientId: string, returnUrl: string, requiredPermissions: string) {
      if(environment.production) {
          window.location.href = `http://${ConstService.CONST.STRAVA_BASE}/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${returnUrl}?exchange_token&approval_prompt=force&scope=${requiredPermissions}`
      } else {
        LocalStorageService.setObject(sampleUser);
        this.router.navigateByUrl('board')
      }
  }

  getToken(code: string) {
    let params = new HttpParams();
    params = params.append('client_id', ConstService.STRAVA_CONFIG.STRAVA_CLIENT_ID);
    params = params.append('client_secret', ConstService.STRAVA_CONFIG.STRAVA_CLIENT_SECRET);
    params = params.append('code', code);
    params = params.append('grant_type', 'authorization_code');

    return this.getAuthRequest(params)
  }

  refreshToken(refreshToken: string) {
    let params = new HttpParams();
    params = params.append('client_id', ConstService.STRAVA_CONFIG.STRAVA_CLIENT_ID);
    params = params.append('client_secret', ConstService.STRAVA_CONFIG.STRAVA_CLIENT_SECRET);
    params = params.append('refresh_token', refreshToken);
    params = params.append('grant_type', 'refresh_token');

    return this.getAuthRequest(params)
  }

  private getAuthRequest(params: HttpParams) {
    return this.httpClient.post('https://' + ConstService.CONST.STRAVA_BASE + '/oauth/token', null, { params })
      .pipe(tap(async (res: any) => {
        LocalStorageService.setObject(res);
        this.loggedIn.next(true);
        if(res.athlete) {
          await this.storeAthlete(res.athlete)
        }
      }))
  }

  async storeAthlete(athlete: any) {
      return this.httpClient.post(`${environment.baseBE}/save-athlete`, {
          athlete,
          accessToken: LocalStorageService.accessToken
      }).subscribe()
  }

  login() {
    this.authorize(ConstService.STRAVA_CONFIG.STRAVA_CLIENT_ID, environment.authReturnUrl, REQUIRED_PERMISSIONS);
  }

  logout() {
    localStorage.clear()
    this.loggedIn.next(false);
    this.router.navigateByUrl('/login')
  }
}
