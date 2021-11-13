import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './components/admin/admin.component';
import {AdminRoutingModule} from "./admin-routing.module";
import { CardCreateComponent } from './components/card-create/card-create.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../shared/shared.module";
import { AdminCommandsComponent } from './components/admin-commands/admin-commands.component';
import {AdminService} from "./admin.service";
import { ActivityReviewComponent } from './components/activity-review/activity-review.component';
import { CardManagementComponent } from './components/card-management/card-management.component';
import { CardFactoryComponent } from './components/card-factory/card-factory.component';
import { CardInstanceCreateComponent } from './components/card-instance-create/card-instance-create.component';
import { AthleteManagementComponent } from './components/athlete-management/athlete-management.component';
import { DeckComponent } from './components/deck/deck.component';
import { LogsComponent } from './components/logs/logs.component';
import { LogItemComponent } from './components/log-item/log-item.component';
import { AdminParentComponent } from './components/admin-parent/admin-parent.component';
import { AdminDeckComponent } from './components/admin-deck/admin-deck.component';


@NgModule({
  declarations: [
    AdminComponent,
    CardCreateComponent,
    AdminCommandsComponent,
    ActivityReviewComponent,
    CardManagementComponent,
    CardFactoryComponent,
    CardInstanceCreateComponent,
    AthleteManagementComponent,
    DeckComponent,
    LogsComponent,
    LogItemComponent,
    AdminParentComponent,
    AdminDeckComponent
  ],
    imports: [
        CommonModule,
        AdminRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        ReactiveFormsModule
    ],
  providers: [
    {
      provide: AdminService
    }
  ]
})
export class AdminModule { }
