import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {LocalStorageService} from "./local-storage.service";
import {ActivityService} from "./activity.service";
import {CONST} from "../app.module";
import {filter} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import Athlete from "../interfaces/athlete";

@Injectable({
    providedIn: 'root'
})
export class AthleteService {

    public athletes = new BehaviorSubject<Athlete[]>([]);
    public me = new BehaviorSubject<Athlete | null>(null);
    public permissions = new BehaviorSubject<string[]>([]);
    private athleteCollection = this.db.collection(CONST.COLLECTIONS.ATHLETES);

    constructor(private db: AngularFirestore,
                private activityService: ActivityService,
                private http: HttpClient) {
        this.athleteCollection.valueChanges().subscribe((athletes: any[]) => {
            this.athletes.next(athletes)
            this.me.next(athletes.find((athlete: Athlete) => athlete.id === LocalStorageService.athlete.id) || null)
            this.permissions.next(this.me.value?.permissions || [])
        });
    }

    permissionPromise() {
        return new Promise((resolve) => {
            this.permissions.pipe(filter((perms) => !!perms.length))
                .subscribe( () => {
                    resolve(true);
                });
        });
    }

    hasPermission(permission: string): boolean{
        return this.permissions.value.indexOf(permission) !== -1;
    }

    getAthlete(athleteId: string) {
        return this.athletes.value.find((athlete: any) => athlete.id.toString() === athleteId) || {}
    }

    setDivisions(athleteIds: string[], divisions: any) {
        return this.http.post(`${environment.baseBE}/set-divisions`, {
            athleteIds,
            divisions
        })
    }

    setPermissions(athleteIds: string[], permissions: string[]) {
        return this.http.post(`${environment.baseBE}/set-permissions`, {
            athleteIds,
            permissions
        })
    }
}
