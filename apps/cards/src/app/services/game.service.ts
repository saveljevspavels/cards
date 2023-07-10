import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import Game from "../interfaces/game";
import {ConstService} from "./const.service";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {AbilityKey} from "../../../../shared/interfaces/ability.interface";

@Injectable({
  providedIn: 'root'
})
export class GameService {

    public gameData = new BehaviorSubject<Game | null>(null);
    private gameDocument = this.db.collection(ConstService.CONST.COLLECTIONS.GAME).doc(ConstService.CONST.GAME_ID);

    constructor(private db: AngularFirestore,
                private http: HttpClient) {
        this.gameDocument.valueChanges().subscribe((game: any) => {
            this.gameData.next(game)
        });
    }

    getCreatures() {
        return this.http.get(`${environment.baseBE}/creatures`)
    }

    useAbility(abilityKey: AbilityKey) {
        return this.http.post(`${environment.baseBE}/game/ability`,
            {
                abilityKey
            }
        )
    }
}
