import { Injectable } from '@angular/core';
import {BehaviorSubject, combineLatest, forkJoin, Observable} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {filter, map, mergeMap, tap} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {ConstService} from "./const.service";
import Athlete from "../../../../shared/interfaces/athlete.interface";

@Injectable({
    providedIn: 'root'
})
export class AthleteService {

    public athletes = new BehaviorSubject<Athlete[]>([]);
    public me = new BehaviorSubject<Athlete | null>(null);
    public myId = new BehaviorSubject<string>('');
    public static permissions = new BehaviorSubject<string[] | null>(null);
    private athleteCollection = this.db.collection(ConstService.CONST.COLLECTIONS.ATHLETES);

    constructor(private db: AngularFirestore,
                private http: HttpClient) {
        combineLatest([
            this.myId,
            this.athleteCollection.valueChanges()
        ]).subscribe(([myId, athletes]: any) => {
            this.athletes.next(athletes);
            const currentAthlete = athletes.find((athlete: Athlete) => athlete.id === myId) || null;
            if(JSON.stringify(this.me.value) !== JSON.stringify(currentAthlete)) {
                this.me.next(currentAthlete);
            }
            AthleteService.permissions.next(this.me.value?.permissions || ['default'])
        });
    }

    static permissionPromise() {
        return new Promise((resolve) => {
            AthleteService.permissions.pipe(filter((perms) => !!perms))
                .subscribe( (perms) => {
                    resolve(true);
                });
        });
    }

    hasPermission(permission: string): boolean{
        return AthleteService.permissions.value?.indexOf(permission) !== -1;
    }

    getAthlete(athleteId: string): Athlete | null {
        return this.athletes.value.find((athlete: Athlete) => athlete.id.toString() === athleteId) || null
    }

    getAthlete$(athleteId: string) {
        return this.athletes.pipe(
            filter((athletes) => !!athletes.length),
            map(() => this.getAthlete(athleteId))
        )
    }

    claimBaseReward(type: string) {
        return this.http.post(`${environment.baseBE}/athlete/claim-base-reward`, {
            type
        })
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
