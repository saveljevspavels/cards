import {inject, Injectable} from "@angular/core";
import {distinctUntilChanged, filter, flatMap} from "rxjs/operators";
import {COMMANDS} from "../constants/commands";
import {ActivityService} from "./activity.service";
import {GameService} from "./game.service";
import {combineLatest, Observable} from "rxjs";
import {AthleteService} from "./athlete.service";
import {ConstService} from "./const.service";
import {collection, collectionData, Firestore, query, where} from "@angular/fire/firestore";

@Injectable({
    providedIn: 'root'
})
export class CommandsService {
    firestore: Firestore = inject(Firestore);

    constructor(private activityService: ActivityService,
                private athleteService: AthleteService,
                private gameService: GameService
                ) {
    }

    init() {
        const commandsCollection = collection(this.firestore, ConstService.CONST.COLLECTIONS.COMMANDS);
        this.athleteService.myId.pipe(
            distinctUntilChanged(),
            filter(id => !!id),
            flatMap((id) =>
                combineLatest([
                    (collectionData(query(commandsCollection, where('athleteId', '==', id))) as Observable<any>).pipe(distinctUntilChanged()),
                    this.gameService.gameData.asObservable()
                ])
            )
        )
        .subscribe(([commands, game]: any) => {
            commands.forEach((command: any) => {
                switch(command.type) {
                    case COMMANDS.REQUEST_ACTIVITIES:
                        this.activityService.requestActivities({
                            from: (+new Date(game?.startDate)),
                            commandId: command.id
                        }).subscribe()
                        break;
                    case COMMANDS.CALCULATE_BASE_WORKOUT:
                        this.activityService.calculateBaseWorkout({
                            athleteId: this.athleteService.myId.value,
                            commandId: command.id
                        }).subscribe()
                        break;
                }
            })
        });
    }
}
