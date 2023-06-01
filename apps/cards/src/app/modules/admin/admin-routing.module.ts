import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from "./components/admin/admin.component";
import {AthleteService} from "../../services/athlete.service";
import {ActivityService} from "../../services/activity.service";
import {CardManagementComponent} from "./components/card-management/card-management.component";
import {AthleteManagementComponent} from "./components/athlete-management/athlete-management.component";
import {LogsComponent} from "./components/logs/logs.component";
import {AdminParentComponent} from "./components/admin-parent/admin-parent.component";
import {AchievementManagementComponent} from "./components/achievement-management/achievement-management.component";
import {CardSchemeComponent} from "./components/card-scheme/card-scheme.component";

const routes: Routes = [
    {
        path: '',
        component: AdminParentComponent,
        children: [
            {
                path: '',
                redirectTo: 'activities',
                pathMatch: 'full'
            },
            {
                path: 'activities',
                component: AdminComponent
            },
            {
                path: 'card-management',
                component: CardManagementComponent
            },
            {
                path: 'card-scheme',
                component: CardSchemeComponent
            },
            {
                path: 'athlete-management',
                component: AthleteManagementComponent
            },
            {
                path: 'achievement-management',
                component: AchievementManagementComponent
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
