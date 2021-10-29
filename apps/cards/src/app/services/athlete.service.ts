import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {LocalStorageService} from "./local-storage.service";
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
    public permissions = new BehaviorSubject<string[] | null>(null);
    private athleteCollection = this.db.collection(CONST.COLLECTIONS.ATHLETES);

    constructor(private db: AngularFirestore,
                private http: HttpClient) {
        this.athleteCollection.valueChanges().subscribe((athletes: any[]) => {
            this.athletes.next(athletes)
            this.me.next(athletes.find((athlete: Athlete) => athlete.id === LocalStorageService.athlete?.id) || null)
            this.permissions.next(this.me.value?.permissions || ['default'])
        });
    }

    permissionPromise() {
        return new Promise((resolve) => {
            this.permissions.pipe(filter((perms) => !!perms))
                .subscribe( (perms) => {
                    resolve(true);
                });
        });
    }

    hasPermission(permission: string): boolean{
        return this.permissions.value?.indexOf(permission) !== -1;
    }

    getAthlete(athleteId: string): Athlete | null {
        return this.athletes.value.find((athlete: Athlete) => athlete.id.toString() === athleteId) || null
    }

    updateBaseWorkout(athleteIds: string[], baseWorkout: any) {
        return this.http.post(`${environment.baseBE}/update-base-workout`, {
            athleteIds,
            baseWorkout
        })
    }

    setPermissions(athleteIds: string[], permissions: string[]) {
        return this.http.post(`${environment.baseBE}/set-permissions`, {
            athleteIds,
            permissions
        })
    }
}
