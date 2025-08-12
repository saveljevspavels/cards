import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, skip } from 'rxjs';
import { distinctUntilChanged, filter, map, pairwise } from 'rxjs/operators';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {ConstService} from "./const.service";
import Athlete from "../../../../shared/classes/athlete.class";
import {PERMISSIONS} from "../constants/permissions";
import {Router} from "@angular/router";
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/compat/firestore";
import { StoreItem } from '../../../../shared/interfaces/store-item.interface';
import { CONST } from '../../../../../definitions/constants';
import { STORE_ITEMS } from '../../../../../definitions/storeItems';

@Injectable({
    providedIn: 'root'
})
export class AthleteService {

    public athletes = new BehaviorSubject<Athlete[]>([]);
    public me = new BehaviorSubject<Athlete | null>(null);
    public myId = new BehaviorSubject<string>('');
    public static permissions = new BehaviorSubject<string[] | null>(null);
    public isAdmin$ = AthleteService.permissions.pipe((map((permissions) => permissions?.indexOf(PERMISSIONS.ADMIN) !== -1)));
    private athleteCollection: AngularFirestoreCollection;
    public inventoryItems = new BehaviorSubject<StoreItem[]>([]);

    constructor(
        private db: AngularFirestore,
        private http: HttpClient,
        private router: Router
    ) {
        this.athleteCollection = this.db.collection(ConstService.CONST.COLLECTIONS.ATHLETES);
        combineLatest([
            this.myId,
            this.athleteCollection.valueChanges().pipe(skip(1))
        ]).subscribe(([myId, athletes]: any) => {
            athletes = athletes.map((athlete: Athlete) => Athlete.fromJSONObject(athlete));
            this.athletes.next(athletes as Athlete[]);
            const currentAthlete = athletes.find((athlete: Athlete) => athlete.id === myId) || null;
            if(JSON.stringify(this.me.value) !== JSON.stringify(currentAthlete)) {
                this.me.next(currentAthlete);

                const inventoryItems: StoreItem[] = [];
                CONST.INVENTORY_DISPLAYED_ITEMS.forEach((itemId) => {
                    const item = STORE_ITEMS.find(item => item.id === itemId);
                    if(item) {
                        // @ts-ignore
                        for(let i = 0; i < currentAthlete.currencies[itemId]; i++) {
                            inventoryItems.push(item);
                        }
                    }
                });
                this.inventoryItems.next(inventoryItems);
            }
            AthleteService.permissions.next(this.me.value?.permissions || [])
        });

        AthleteService.permissions.pipe(pairwise()).subscribe(([oldPermissions, newPermissions]) => {
            if((newPermissions || []).length < (oldPermissions || []).length) {
                this.router.navigateByUrl('/board');
            }
        })
    }

    static permissionPromise() {
        return new Promise((resolve) => {
            AthleteService.permissions.pipe(filter((perms) => !!perms))
                .subscribe( (perms) => {
                    resolve(true);
                });
        });
    }

    hasPermission$(permission: string): Observable<boolean> {
        return AthleteService.permissions.pipe(map((permissions) => {
            return permissions?.indexOf(permission) !== -1;
        }));
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
