import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BoardComponent} from "./components/board/board.component";
import {BoardRoutingModule} from "./board-routing.module";
import { HandComponent } from './components/hand/hand.component';
import {SharedModule} from "../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { ActivityListComponent } from './components/activity-list/activity-list.component';
import {LeaderboardComponent} from "./components/leaderboard/leaderboard.component";
import {ScoresComponent} from "../shared/components/scores/scores.component";
import {ActivityService} from "../../services/activity.service";
import { ProfileComponent } from './components/profile/profile.component';
import { CardQueueComponent } from './components/card-queue/card-queue.component';


@NgModule({
  declarations: [
    BoardComponent,
    HandComponent,
    ActivityListComponent,
    LeaderboardComponent,
    ScoresComponent,
    ProfileComponent,
    CardQueueComponent
  ],
  imports: [
    CommonModule,
    BoardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class BoardModule { }
