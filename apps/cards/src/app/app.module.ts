import {APP_INITIALIZER, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {RouterModule} from "@angular/router";

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {HttpMainInterceptor} from "./services/http.interceptor";
import * as FIREBASE_CONFIG from '../../../../definitions/firebaseConfig.json';
import {environment} from "../environments/environment";
import {MessagesModule} from "primeng/messages";
import {MessageModule} from "primeng/message";
import {MessageService} from "primeng/api";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AthleteService} from "./services/athlete.service";

const firebaseConfig = FIREBASE_CONFIG;

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        RouterModule,
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFirestoreModule, // firestore
        AngularFireAuthModule, // auth
        AngularFireStorageModule, // storage,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MessagesModule,
        MessageModule,
        BrowserAnimationsModule
    ],
    providers: [
        {provide: HTTP_INTERCEPTORS, useClass: HttpMainInterceptor, multi: true},
        {
            provide: APP_INITIALIZER,
            useFactory: (athleteService: AthleteService) => () => athleteService.permissionPromise(),
            deps: [AthleteService],
            multi: true
        },
        MessageService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

export const CONST: any = environment.const;
export const RULES: any = environment.rules;
export const STRAVA_CONFIG: any = environment.stravaConfig;
