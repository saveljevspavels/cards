import {Injectable} from "@angular/core";
import {AngularFirestore} from "@angular/fire/firestore";
import {distinctUntilChanged, filter} from "rxjs/operators";
import {COMMANDS} from "../constants/commands";
import {ActivityService} from "./activity.service";
import {GameService} from "./game.service";
import {combineLatest} from "rxjs";
import {AthleteService} from "./athlete.service";
import {ConstService} from "./const.service";
import {flatMap} from "rxjs/internal/operators";

@Injectable({
    providedIn: 'root'
})
export class CommandsService {

    constructor(private db: AngularFirestore,
                private activityService: ActivityService,
                private athleteService: AthleteService,
                private gameService: GameService
                ) {
    }

    init() {
        this.athleteService.myId.pipe(
            distinctUntilChanged(),
            filter(id => !!id),
            flatMap((id) =>
                combineLatest([
                    this.db.collection(
                        ConstService.CONST.COLLECTIONS.COMMANDS,
                        (ref) => ref.where('athleteId', '==', id)).valueChanges().pipe(distinctUntilChanged()),
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
