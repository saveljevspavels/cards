import { NgModule } from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "./guards/auth.guard";
import {LoggedGuard} from "./guards/logged.guard";
import {AdminGuard} from "./guards/admin.guard";

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
    path: 'board',
    loadChildren: () =>
      import('./modules/board/board.module').then(
        (mod) => mod.BoardModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./modules/admin/admin.module').then(
        (mod) => mod.AdminModule
      ),
    canActivate: [AuthGuard, AdminGuard]
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
