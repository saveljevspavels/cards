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
import { ProfileComponent } from './components/profile/profile.component';
import { CardQueueComponent } from './components/card-queue/card-queue.component';
import { RulesComponent } from './components/rules/rules.component';
import { CounterItemComponent } from './components/card-counter/counter-item/counter-item.component';
import { BoardParentComponent } from './components/board-parent/board-parent.component';
import { SubmittingActivityComponent } from './components/submitting-activity/submitting-activity.component';
import {CounterLineComponent} from "./components/card-counter/counter-line/counter-line.component";
import { CardFilterComponent } from './components/card-filter/card-filter.component';
import { GenericCounterComponent } from './components/generic-counter/generic-counter.component';
import {EnergyLineComponent} from "./components/energy-line/energy-line.component";
import {CoinsDisplayComponent} from "./components/coins-display/coins-display.component";

@NgModule({
    declarations: [
        BoardComponent,
        HandComponent,
        ActivityListComponent,
        LeaderboardComponent,
        ScoresComponent,
        ProfileComponent,
        CardQueueComponent,
        RulesComponent,
        CoinsDisplayComponent,
        CounterLineComponent,
        CounterItemComponent,
        BoardParentComponent,
        SubmittingActivityComponent,
        CardFilterComponent,
        GenericCounterComponent,
        GenericCounterComponent,
        EnergyLineComponent,
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
