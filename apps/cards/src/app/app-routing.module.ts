import { NgModule } from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "./guards/auth.guard";
import {LoggedGuard} from "./guards/logged.guard";
import {AdminGuard} from "./guards/admin.guard";
import {ApprovalGuard} from "./guards/approval.guard";
import {WaitingRoomComponent} from "./modules/auth/waiting-room/waiting-room.component";
import {WaitingRoomGuard} from "./guards/waiting-room.guard";

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./modules/auth/auth.module').then(
        (mod) => mod.AuthModule
      ),
    canActivate: [LoggedGuard]
  },
  {
    path: 'waiting-room',
    component: WaitingRoomComponent,
    canActivate: [AuthGuard, WaitingRoomGuard]
  },
  {
    path: 'board',
    loadChildren: () =>
      import('./modules/board/board.module').then(
        (mod) => mod.BoardModule
      ),
    canActivate: [AuthGuard, ApprovalGuard],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./modules/admin/admin.module').then(
        (mod) => mod.AdminModule
      ),
    canActivate: [AuthGuard, AdminGuard, ApprovalGuard]
  }
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
