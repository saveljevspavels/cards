import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {AuthService} from "../services/auth.service";
import {LocalStorageService} from "../services/local-storage.service";
import {AthleteService} from "../services/athlete.service";
import {filter, first, map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router,
              private authService: AuthService,
              private athleteService: AthleteService
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(LocalStorageService.jwt) {
      this.authService.decodeId();
      return this.athleteService.me.pipe(
          first(),
          map(me => {
        if(me) {
          return true;
        } else {
          this.authService.clearUserData();
          return this.router.parseUrl('/login');
        }
      }));
    } else {
      return this.router.parseUrl('/login');
    }
  }
}

