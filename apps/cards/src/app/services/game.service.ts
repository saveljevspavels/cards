import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import Game from "../interfaces/game";
import {ConstService} from "./const.service";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {AbilityKey} from "../../../../shared/interfaces/ability.interface";
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/compat/firestore";
import {map} from "rxjs/operators";
import {Currencies} from "../../../../shared/classes/currencies.class";

@Injectable({
  providedIn: 'root'
})
export class GameService {

    public gameData = new BehaviorSubject<Game | null>(null);

    constructor(private db: AngularFirestore,
                private http: HttpClient) {
        this.db.collection(ConstService.CONST.COLLECTIONS.GAME,
            (ref: any) => ref.where('id', '==', ConstService.CONST.GAME_ID)).valueChanges().subscribe((games: any) => {
            if(games.length === 1) {
                this.gameData.next(games[0])
            }
        });
    }

    getCreatures() {
        return this.http.get(`${environment.baseBE}/creatures`)
    }

    useAbility(abilityKey: string) {
        return this.http.post(`${environment.baseBE}/abilities/activate`,
            {
                abilityKey
            }
        )
    }

    getRandomAbility(): Observable<AbilityKey> {
        return this.http.post(`${environment.baseBE}/abilities/random`, {}).pipe(
            map((res: any) => res.abilityKey)
        );
    }

    openChest(): Observable<Currencies> {
        return this.http.post(`${environment.baseBE}/abilities/open-chest`, {}).pipe(
            map((res: any) => res.rewards)
        );
    }
}
