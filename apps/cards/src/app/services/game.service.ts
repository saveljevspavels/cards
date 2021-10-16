import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {LocalStorageService} from "./local-storage.service";
import {HttpClient} from "@angular/common/http";
import {CONST} from "../app.module";
import {environment} from "../../environments/environment";
import {map} from "rxjs/operators";
import Hand from "../interfaces/hand";

@Injectable({
  providedIn: 'root'
})
export class GameService {

    public cardUses = new BehaviorSubject<any>(0);
    private gameDocument = this.db.collection(CONST.COLLECTIONS.GAME).doc(CONST.GAME_ID);

    constructor(private db: AngularFirestore,
                private http: HttpClient) {
        this.gameDocument.valueChanges().subscribe((game: any) => {
            this.cardUses.next(game.cardUses)
        });
    }
}
