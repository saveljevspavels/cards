import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import {AuthRoutingModule} from "./auth-routing.module";
import { AuthReturnComponent } from './components/auth-return/auth-return.component';
import {SharedModule} from "../shared/shared.module";
import {WaitingRoomComponent} from "./waiting-room/waiting-room.component";



@NgModule({
    declarations: [
        LoginComponent,
        AuthReturnComponent,
        WaitingRoomComponent
    ],
    imports: [
        CommonModule,
        AuthRoutingModule,
        SharedModule
    ]
})
export class AuthModule { }
