import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from "./components/admin/admin.component";
import {AthleteService} from "../../services/athlete.service";
import {ActivityService} from "../../services/activity.service";
import {CardManagementComponent} from "./components/card-management/card-management.component";

const routes: Routes = [
  {
    path: '',
    component: AdminComponent
  },
  {
    path: 'card-management',
    component: CardManagementComponent
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
  providers: [
    AthleteService,
    ActivityService
  ]
})
export class AdminRoutingModule { }
