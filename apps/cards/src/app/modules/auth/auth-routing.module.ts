import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {AuthReturnComponent} from "./components/auth-return/auth-return.component";
import {WaitingRoomComponent} from "./waiting-room/waiting-room.component";

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'return',
    component: AuthReturnComponent
  },
  {
    path: 'waiting',
    component: WaitingRoomComponent
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
