import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {AuthService} from "../services/auth.service";
import {catchError, map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router,
              private authService: AuthService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(tokenExpired(parseInt(localStorage.getItem('expires_at') || '0', 10))) {
      console.log(' expired!')
      const refreshToken = localStorage.getItem('refresh_token') || ''
      if(refreshToken) {
        return this.authService.refreshToken(refreshToken).pipe(
          map((_) => true),
          catchError((err) => of(this.router.parseUrl('/login'))))
      }
      return this.router.parseUrl('/login');
    } else {
      return true;
    }
  }
}

export const tokenExpired = (expiresAt: number) => {
  return + new Date > ( expiresAt * 1000 );
}
