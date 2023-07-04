import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {PERMISSIONS} from "../constants/permissions";
import {AthleteService} from "../services/athlete.service";

@Injectable({
  providedIn: 'root'
})
export class WaitingRoomGuard implements CanActivate {
  constructor(private router: Router,
              private athleteService: AthleteService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return !this.athleteService.hasPermission(PERMISSIONS.DEFAULT) || this.router.navigateByUrl('/board')
  }
}
