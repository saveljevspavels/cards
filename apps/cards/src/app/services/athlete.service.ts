import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {LocalStorageService} from "./local-storage.service";
import {COMMANDS} from "../constants/commands";
import {ActivityService} from "./activity.service";
import {GAME_START} from "../constants/game";
import {CONST} from "../app.module";
import {filter, map} from "rxjs/operators";
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
    private commandCollection = this.db.collection(CONST.COLLECTIONS.COMMANDS,
    (ref) => ref.where('athleteId', '==', LocalStorageService.athlete.id.toString()));

    constructor(private db: AngularFirestore,
                private activityService: ActivityService,
                private http: HttpClient) {
        this.athleteCollection.valueChanges().subscribe((athletes: any[]) => {
            this.athletes.next(athletes)
            this.me.next(athletes.find((athlete: Athlete) => athlete.id === LocalStorageService.athlete.id) || null)
            this.permissions.next(this.me.value?.permissions || [])
        });

        this.commandCollection.valueChanges().subscribe((commands: any[]) => {
            commands.forEach(command => {
                switch(command.type) {
                    case COMMANDS.REQUEST_ACTIVITIES:
                        this.activityService.requestActivities({
                            from: GAME_START,
                            commandId: command.id
                        }).subscribe()
                    break;
                }
            })
        });
    }

    permissionPromise() {
        return new Promise((resolve) => {
            this.permissions.pipe(filter((perms) => perms !== null))
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
