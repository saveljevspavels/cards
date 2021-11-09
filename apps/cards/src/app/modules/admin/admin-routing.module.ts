import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from "./components/admin/admin.component";
import {AthleteService} from "../../services/athlete.service";
import {ActivityService} from "../../services/activity.service";
import {CardManagementComponent} from "./components/card-management/card-management.component";
import {AthleteManagementComponent} from "./components/athlete-management/athlete-management.component";
import {LogsComponent} from "./components/logs/logs.component";
import {AdminParentComponent} from "./components/admin-parent/admin-parent.component";

const routes: Routes = [
    {
        path: '',
        component: AdminParentComponent,
        children: [
            {
                path: 'game',
                component: AdminComponent
            },
            {
                path: 'card-management',
                component: CardManagementComponent
            },
            {
                path: 'athlete-management',
                component: AthleteManagementComponent
            },
            {
                path: 'logs',
                component: LogsComponent
            }
        ]
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
