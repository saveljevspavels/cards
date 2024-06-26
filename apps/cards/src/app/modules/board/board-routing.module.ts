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
import {SubmittingActivityComponent} from "./components/submitting-activity/submitting-activity.component";
import {CardBoardComponent} from "./components/card-board/card-board.component";
import {LeaderboardGuard} from "../../guards/leaderboard.guard";
import {LevelOverviewComponent} from "./components/level-overview/level-overview.component";
import {TaskOverviewComponent} from "./components/task-overview/task-overview.component";

const routes: Routes = [
    {
        path: 'submit-activity',
        component: SubmittingActivityComponent
    },
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
                component: BoardComponent,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'tasks'
                    },
                    {
                        path: 'tasks',
                        component: TaskOverviewComponent
                    },
                    {
                        path: 'challenges',
                        component: LevelOverviewComponent
                    },
                ]
            },
            {
                path: 'board',
                component: CardBoardComponent,
            },
            {
                path: 'activity-list',
                component: ActivityListComponent
            },
            {
                path: 'leaderboard',
                component: LeaderboardComponent,
                canActivate: [LeaderboardGuard]
            },
            {
                path: 'athletes',
                children: [
                    {
                        path: 'profile',
                        component: ProfileComponent
                    },
                    {
                        path: ':athleteId/profile',
                        component: ProfileComponent
                    },
                ]
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
    ActivityService,
    ScoreService
  ]
})
export class BoardRoutingModule { }
