import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {LocalStorageService} from "./local-storage.service";
import {HttpClient} from "@angular/common/http";
import {CONST} from "../app.module";
import {environment} from "../../environments/environment";
import {map} from "rxjs/operators";
import Hand from "../interfaces/hand";
import Game from "../interfaces/game";

@Injectable({
  providedIn: 'root'
})
export class GameService {

    public gameData = new BehaviorSubject<Game | null>(null);
    private gameDocument = this.db.collection(CONST.COLLECTIONS.GAME).doc(CONST.GAME_ID);

    constructor(private db: AngularFirestore) {
        this.gameDocument.valueChanges().subscribe((game: any) => {
            this.gameData.next(game)
        });
    }
}
