import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../../services/auth.service";
import {REQUIRED_PERMISSIONS} from "../../../../constants/constants";
import {LocalStorageService} from "../../../../services/local-storage.service";

@Component({
  selector: 'app-auth-return',
  templateUrl: './auth-return.component.html',
  styleUrls: ['./auth-return.component.scss']
})
export class AuthReturnComponent implements OnInit {

  responseParams: any;

  constructor(private route: ActivatedRoute,
              private authService: AuthService,
              private router: Router) { }

  ngOnInit(): void {
    this.responseParams = this.route.snapshot.queryParams;
    if(this.responseParams?.code && this.responseParams.scope === REQUIRED_PERMISSIONS) {
      this.authService.getJwtToken(this.responseParams.code).subscribe(res => {
        LocalStorageService.jwt = res;
        this.router.navigateByUrl('board/main');
      })
    } else {
      console.error('Not all permissions granted')
      this.router.navigateByUrl('login');
    }
  }

}
