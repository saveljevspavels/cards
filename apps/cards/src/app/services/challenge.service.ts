import {Injectable} from "@angular/core";
import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/compat/firestore";
import {HttpClient} from "@angular/common/http";
import {ConstService} from "./const.service";
import {ProgressiveChallenge} from "../../../../shared/interfaces/progressive-challenge.interface";
import {environment} from "../../environments/environment";
import {AthleteService} from "./athlete.service";
import {map} from "rxjs/operators";
import {GameService} from "./game.service";
import {ChallengeProgress} from "../../../../shared/classes/challenge-progress";

@Injectable({
    providedIn: 'root'
})
export class ChallengeService {

    public challenges = new BehaviorSubject<ProgressiveChallenge[]>([]);
    public activeChallenges = new Observable<ProgressiveChallenge[]>;
    public challengeProgress = new BehaviorSubject<ProgressiveChallenge[]>([]);
    private challengeCollection: AngularFirestoreCollection<ProgressiveChallenge[]>;
    public myProgress$: Observable<ChallengeProgress>;

    constructor(
        private db: AngularFirestore,
        private http: HttpClient,
        private athleteService: AthleteService,
        private gameService: GameService
    ) {
        this.challengeCollection = this.db.collection(ConstService.CONST.COLLECTIONS.CHALLENGES);
        this.myProgress$ = this.db.collection(ConstService.CONST.COLLECTIONS.CHALLENGE_PROGRESS,
            (ref: any) => ref.where('athleteId', '==', athleteService.myId.value)
        ).valueChanges().pipe(map((progress: any) => progress.length ? progress[0] as ChallengeProgress : new ChallengeProgress(athleteService.myId.value)));
        this.challengeCollection.valueChanges().subscribe((challenges: any) => {
            this.challenges.next(challenges as ProgressiveChallenge[]);
        });

        this.myProgress$.subscribe((progress: any) => {
            console.log('progress', progress);
        });

        this.activeChallenges = combineLatest([
            this.challenges,
            this.gameService.gameData
        ]).pipe(map(([challenges, game]) => {
            return challenges.filter(challenge => game?.activeChallenges.indexOf(challenge.id) !== -1);
        }))
    }



    createChallenge(challenge: ProgressiveChallenge) {
        return this.http.post(`${environment.baseBE}/challenges/create`, {
            challenge
        })
    }
}
