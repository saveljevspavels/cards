import {inject, Injectable} from "@angular/core";
import {distinctUntilChanged, filter, first, flatMap, map, mergeMap, pairwise, startWith, tap} from "rxjs/operators";
import {COMMANDS} from "../constants/commands";
import {ActivityService} from "./activity.service";
import {GameService} from "./game.service";
import {combineLatest, forkJoin, Observable} from "rxjs";
import {AthleteService} from "./athlete.service";
import {ConstService} from "./const.service";
import {AngularFirestore} from "@angular/fire/compat/firestore";

@Injectable({
    providedIn: 'root'
})
export class CommandsService {

    constructor(private activityService: ActivityService,
                private athleteService: AthleteService,
                private gameService: GameService,
                private db: AngularFirestore,
                ) {
    }

    init() {
        forkJoin([
            this.athleteService.myId.pipe(
                filter(id => !!id),
                first(),
            ),
            this.gameService.gameData.asObservable().pipe(
                filter(game => !!game),
                first()
            )
        ]).pipe(
            tap(([id, game]: any) => console.log('ID', id, game)),
            mergeMap(([id, game]: any) => this.db.collection(
                ConstService.CONST.COLLECTIONS.COMMANDS,
                (ref: any) => ref.where('athleteId', '==', id)
            ).valueChanges()
                    .pipe(
                        startWith(null),
                        pairwise(),
                        filter(([prev, next]) => {
                            return !!next && !!next.length && (!prev || prev.toString() !== next.toString());
                        }),
                        map((commands: any) => [commands[1], game]),
                    ),
        )).subscribe(([commands, game]: any) => {
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
