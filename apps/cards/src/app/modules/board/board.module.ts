import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BoardComponent} from "./components/board/board.component";
import {BoardRoutingModule} from "./board-routing.module";
import {SharedModule} from "../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { ActivityListComponent } from './components/activity-list/activity-list.component';
import {LeaderboardComponent} from "./components/leaderboard/leaderboard.component";
import {ScoresComponent} from "../shared/components/scores/scores.component";
import { ProfileComponent } from './components/profile/profile.component';
import { RulesComponent } from './components/rules/rules.component';
import { CounterItemComponent } from './components/card-counter/counter-item/counter-item.component';
import { BoardParentComponent } from './components/board-parent/board-parent.component';
import { SubmittingActivityComponent } from './components/submitting-activity/submitting-activity.component';
import { CardFilterComponent } from './components/card-filter/card-filter.component';
import { GenericCounterComponent } from './components/generic-counter/generic-counter.component';
import {EnergyLineComponent} from "./components/energy-line/energy-line.component";
import {CoinsDisplayComponent} from "./components/coins-display/coins-display.component";
import {CardSchemeComponent} from "./components/card-scheme/card-scheme.component";
import {AdminModule} from "../admin/admin.module";
import { ActiveCardListComponent } from './components/active-card-list/active-card-list.component';
import { BaseCardComponent } from './components/base-card/base-card.component';
import { CardBoardComponent } from './components/card-board/card-board.component';
import { BoardSelectionComponent } from './components/card-scheme/board-selection/board-selection.component';
import { AddCardButtonComponent } from './components/add-card-button/add-card-button.component';
import { PointsDisplayComponent } from './components/points-display/points-display.component';

@NgModule({
    declarations: [
        BoardComponent,
        ActivityListComponent,
        LeaderboardComponent,
        ScoresComponent,
        ProfileComponent,
        RulesComponent,
        CoinsDisplayComponent,
        CounterItemComponent,
        BoardParentComponent,
        SubmittingActivityComponent,
        CardFilterComponent,
        GenericCounterComponent,
        GenericCounterComponent,
        EnergyLineComponent,
        CardSchemeComponent,
        ActiveCardListComponent,
        BaseCardComponent,
        CardBoardComponent,
        BoardSelectionComponent,
        AddCardButtonComponent,
        PointsDisplayComponent
    ],
    imports: [
        CommonModule,
        BoardRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        AdminModule // TODO: remove
    ]
})
export class BoardModule { }
