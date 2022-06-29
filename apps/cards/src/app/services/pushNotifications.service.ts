import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class PushNotificationsService {

    constructor(private http: HttpClient) {
    }

    submitActivity(subscription: any) {
        console.log('subscription', subscription)
        return this.http.post(`${environment.baseBE}/store-subscription`, {
            subscription
        })
    }
}
