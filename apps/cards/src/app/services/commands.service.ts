import {Injectable} from "@angular/core";
import {CONST} from "../app.module";
import {AngularFirestore} from "@angular/fire/firestore";
import {LocalStorageService} from "./local-storage.service";
import {distinctUntilChanged} from "rxjs/operators";
import {COMMANDS} from "../constants/commands";
import {GAME_START} from "../constants/game";
import {ActivityService} from "./activity.service";

@Injectable({
    providedIn: 'root'
})
export class CommandsService {
    private commandCollection = this.db.collection(CONST.COLLECTIONS.COMMANDS,
        (ref) => ref.where('athleteId', '==', LocalStorageService.athlete.id.toString()));

    constructor(private db: AngularFirestore,
                private activityService: ActivityService) {
    }

    init() {
        console.log('init')
        this.commandCollection.valueChanges().pipe(distinctUntilChanged()).subscribe((commands: any[]) => {
            console.log('commands', commands)
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
}
