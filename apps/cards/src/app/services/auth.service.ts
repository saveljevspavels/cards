import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, mergeMap} from "rxjs/operators";
import {Router} from "@angular/router";
import {environment} from "../../environments/environment";
import {LocalStorageService} from "./local-storage.service";
import {Observable} from "rxjs";
import {decodeJwt} from "../../../../shared/utils/decodeJwt";
import {AthleteService} from "./athlete.service";
import {CONST} from "../../../../../definitions/constants";
import {STRAVA_CONFIG} from "../../../../../definitions/stravaConfig";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient,
              private router: Router,
              private athleteService: AthleteService) {
  }

  getJwt(payload: any): Observable<string> {
      return this.httpClient.post(
          `${environment.baseBE}/auth/token`,
          payload
      ).pipe(
          map((res: any)  => {
              return (res as {jwt: string}).jwt;
          })
      )
  }

  getJwtToken(code: string) {
      return this.httpClient.post(
        `${CONST.STRAVA_BASE}/oauth/token`,
        null,
        {
            params: {
                'client_id': STRAVA_CONFIG.STRAVA_CLIENT_ID,
                'client_secret': STRAVA_CONFIG.STRAVA_CLIENT_SECRET,
                'code': code,
                'grant_type': 'authorization_code'
            }
        }
      ).pipe(mergeMap((res: any) => this.getJwt(res)))
  }

    updateJwtToken(refreshToken: string) {
        return this.httpClient.post(
            `${CONST.STRAVA_BASE}/oauth/token`,
            null,
            {
                params: {
                    'client_id': STRAVA_CONFIG.STRAVA_CLIENT_ID,
                    'client_secret': STRAVA_CONFIG.STRAVA_CLIENT_SECRET,
                    'refresh_token': refreshToken,
                    'grant_type': 'refresh_token'
                }
            }
        ).pipe(mergeMap((res: any) => this.getJwt(res)))
    }

  decodeId() {
      this.athleteService.myId.next(decodeJwt(LocalStorageService.jwt).athleteId);
  }

  async login() {
    this.getAuthUrl().subscribe((url: string) => {
        window.location.href = url;
    })
  }

  getAuthUrl() {
      return this.httpClient.get(`${environment.baseBE}/auth/url?returnUrl=${environment.authReturnUrl}`).pipe(
          map((res:any)  => res.url as string)
      )
  }

  logout() {
      this.clearUserData();
      return this.router.navigateByUrl('/login')
  }

  clearUserData() {
      localStorage.clear()
      this.athleteService.myId.next('');
  }
}
