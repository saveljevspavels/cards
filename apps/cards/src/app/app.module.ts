import {APP_INITIALIZER, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {RouterModule} from "@angular/router";

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
import {SharedModule} from "./modules/shared/shared.module";
import { ServiceWorkerModule } from '@angular/service-worker';
import {AngularFireModule} from "@angular/fire/compat";
import {AngularFirestoreModule} from "@angular/fire/compat/firestore";
import {AngularFireAuthModule} from "@angular/fire/compat/auth";
import {AngularFireStorageModule} from "@angular/fire/compat/storage";

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
        AngularFirestoreModule.enablePersistence(), // firestore
        AngularFireAuthModule, // auth
        AngularFireStorageModule, // storage,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MessagesModule,
        MessageModule,
        BrowserAnimationsModule,
        SharedModule,
        ServiceWorkerModule.register('sw.js', {
          enabled: environment.production,
          // Register the ServiceWorker as soon as the app is stable
          // or after 30 seconds (whichever comes first).
          registrationStrategy: 'registerWhenStable:30000'
        })
    ],
    providers: [
        {provide: HTTP_INTERCEPTORS, useClass: HttpMainInterceptor, multi: true},
        {
            provide: APP_INITIALIZER,
            useFactory: () => () => AthleteService.permissionPromise(),
            deps: [AthleteService],
            multi: true
        },
        MessageService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
