import {Injectable} from "@angular/core";
import {CONST} from "../app.module";
import {AngularFirestore} from "@angular/fire/firestore";
import {LocalStorageService} from "./local-storage.service";
import {distinctUntilChanged} from "rxjs/operators";
import {COMMANDS} from "../constants/commands";
import {ActivityService} from "./activity.service";
import {GameService} from "./game.service";
import {combineLatest} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class CommandsService {
    private commandCollection = LocalStorageService.athlete && this.db.collection(
        CONST.COLLECTIONS.COMMANDS,
        (ref) => ref.where('athleteId', '==', LocalStorageService.athlete.id.toString()));

    constructor(private db: AngularFirestore,
                private activityService: ActivityService,
                private gameService: GameService) {
    }

    init() {
        combineLatest([
            this.commandCollection?.valueChanges().pipe(distinctUntilChanged()),
            this.gameService.gameData.asObservable()
        ])
        .subscribe(([commands, game]: any) => {
            commands.forEach((command: any) => {
                switch(command.type) {
                    case COMMANDS.REQUEST_ACTIVITIES:
                        this.activityService.requestActivities({
                            from: (+new Date(game?.startDate)),
                            commandId: command.id
                        }).subscribe()
                        break;
                }
            })
        });
    }
}
