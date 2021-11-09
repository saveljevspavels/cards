import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BoardComponent} from "./components/board/board.component";
import {ActivityListComponent} from "./components/activity-list/activity-list.component";
import {LeaderboardComponent} from "./components/leaderboard/leaderboard.component";
import {ActivityService} from "../../services/activity.service";
import {AthleteService} from "../../services/athlete.service";
import {ScoreService} from "../../services/score.service";
import {ProfileComponent} from "./components/profile/profile.component";
import {RulesComponent} from "./components/rules/rules.component";
import {BoardParentComponent} from "./components/board-parent/board-parent.component";

const routes: Routes = [
    {
        path: '',
        component: BoardParentComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'main'
            },
            {
                path: 'main',
                component: BoardComponent
            },
            {
                path: 'activity-list',
                component: ActivityListComponent
            },
            {
                path: 'leaderboard',
                component: LeaderboardComponent
            },
            {
                path: 'profile',
                component: ProfileComponent
            },
            {
                path: 'rules',
                component: RulesComponent
            }
        ]
    },
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
  providers: [
    AthleteService,
    ActivityService,
    ScoreService
  ]
})
export class BoardRoutingModule { }
