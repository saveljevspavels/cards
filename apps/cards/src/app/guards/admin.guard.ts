import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {PERMISSIONS} from "../constants/permissions";
import {AthleteService} from "../services/athlete.service";

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router,
              private athleteService: AthleteService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.athleteService.hasPermission(PERMISSIONS.ADMIN) || this.router.navigateByUrl('/login')
  }
}

export const tokenExpired = (expiresAt: number) => {
  return + new Date > ( expiresAt * 1000 );
}
