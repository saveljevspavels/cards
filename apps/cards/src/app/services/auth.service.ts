import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";
import {Router} from "@angular/router";
import {environment} from "../../environments/environment";
import {LocalStorageService} from "./local-storage.service";
import {Observable} from "rxjs";
import {decodeJwt} from "../../../../shared/utils/decodeJwt";
import {AthleteService} from "./athlete.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient,
              private router: Router,
              private athleteService: AthleteService) {
  }

  getJwt(code: string): Observable<string> {
      return this.httpClient.post(
          `${environment.baseBE}/auth/token`,
          {
              code
          }
      ).pipe(
          map((res: any)  => {
              return (res as {jwt: string}).jwt;
          })
      )
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
