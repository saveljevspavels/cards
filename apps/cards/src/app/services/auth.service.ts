import { Injectable } from '@angular/core';
import {
  REQUIRED_PERMISSIONS,
} from "../constants/constants";
import {HttpClient, HttpParams} from "@angular/common/http";
import {filter, map, tap} from "rxjs/operators";
import {Router} from "@angular/router";
import {environment} from "../../environments/environment";
import {LocalStorageService} from "./local-storage.service";
import sampleUser from "../../../../../definitions/sampleUser.json"
import {BehaviorSubject, Observable} from "rxjs";
import {ConstService} from "./const.service";
import {decodeJwt} from "../../../../shared/utils/decodeJwt";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  myId = new BehaviorSubject<string>('');

  constructor(private httpClient: HttpClient,
              private router: Router) {
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
      this.myId.next(decodeJwt(LocalStorageService.jwt).athleteId);
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
    localStorage.clear()
    this.myId.next('');
    this.router.navigateByUrl('/login')
  }
}
