import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {AuthReturnComponent} from "./components/auth-return/auth-return.component";

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'return',
    component: AuthReturnComponent
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
