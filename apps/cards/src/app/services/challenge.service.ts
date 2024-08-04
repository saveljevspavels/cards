import {Injectable} from "@angular/core";
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/compat/firestore";
import {HttpClient} from "@angular/common/http";
import {ConstService} from "./const.service";
import {ProgressiveChallenge} from "../../../../shared/interfaces/progressive-challenge.interface";
import {environment} from "../../environments/environment";
import {AthleteService} from "./athlete.service";
import {distinctUntilChanged, filter, map} from "rxjs/operators";
import {GameService} from "./game.service";
import {ChallengeProgress} from "../../../../shared/classes/challenge-progress";
import {LocalStorageService} from "./local-storage.service";
import {RULES} from "../../../../../definitions/rules";

@Injectable({
    providedIn: 'root'
})
export class ChallengeService {

    public challenges = new BehaviorSubject<ProgressiveChallenge[]>([]);
    public activeChallenges = new Observable<ProgressiveChallenge[]>;
    public _myProgress = new BehaviorSubject<ChallengeProgress>(new ChallengeProgress(''));
    public challengeProgress = new BehaviorSubject<ProgressiveChallenge[]>([]);
    private challengeCollection: AngularFirestoreCollection<ProgressiveChallenge[]>;
    public myProgress$: Observable<ChallengeProgress> = this._myProgress.asObservable();
    public challengeUpdates$ = new Subject<any>();

    constructor(
        private db: AngularFirestore,
        private http: HttpClient,
        private athleteService: AthleteService,
        private gameService: GameService
    ) {
        this.challengeCollection = this.db.collection(ConstService.CONST.COLLECTIONS.CHALLENGES);
        this.db.collection(ConstService.CONST.COLLECTIONS.CHALLENGE_PROGRESS,
            (ref: any) => ref.where('athleteId', '==', athleteService.myId.value)
        ).valueChanges()
            .pipe(map((progress: any) => progress.length ? progress[0] as ChallengeProgress : new ChallengeProgress(athleteService.myId.value)))
            .subscribe((progress: ChallengeProgress) => {
            this._myProgress.next(progress);
        });
        this.challengeCollection.valueChanges().subscribe((challenges: any) => {
            this.challenges.next(challenges as ProgressiveChallenge[]);
        });

        this.activeChallenges = combineLatest([
            this.challenges,
            this.gameService.gameData,
            this.myProgress$
        ]).pipe(map(([challenges, game, progress]) => {
            return challenges
                .filter(challenge => game?.activeChallenges.indexOf(challenge.id) !== -1)
                .filter(challenge => (progress?.claimedChallenges || []).indexOf(challenge.id) === -1)
                .splice(0, RULES.PROGRESSIVE_CHALLENGE.MAX_ACTIVE)
        }))

        this.watchChallengeUpdates();
    }

    claimLevelReward(levelIndex: number) {
        return this.http.post(`${environment.baseBE}/challenges/level/claim`, {
            levelIndex
        })
    }

    claimChallenge(challengeId: String) {
        return this.http.post(`${environment.baseBE}/challenges/claim`, {
            challengeId
        })
    }

    createChallenge(challenge: ProgressiveChallenge) {
        return this.http.post(`${environment.baseBE}/challenges/create`, {
            challenge
        });
    }

    watchChallengeUpdates() {
        this.activeChallenges.subscribe((challenges) => {
            const challengeValues = JSON.parse(LocalStorageService.getValue('challengeValues') || '{}');
            const progress = this._myProgress.value;
            const updates = this.getUpdates(challengeValues, progress.challengeValues);
            if(Object.keys(updates).length === 0 || !challenges.find(challenge => Object.keys(updates).indexOf(challenge.id) !== -1)) {
                return;
            } else {
                this.challengeUpdates$.next({
                    previous: Object.keys(updates).reduce((acc: {[key:string]: number}, key) => {
                        acc[key] = challengeValues[key];
                        return acc;
                    }, {}),
                    current: updates
                });
                LocalStorageService.setValue('challengeValues', JSON.stringify(progress.challengeValues));
            }
        })
    }

    getUpdates(prev: {[key:string]: number}, curr: {[key:string]: number}) {
        return Object.keys(curr).reduce((acc: {[key:string]: number}, key) => {
            if(prev[key] !== curr[key]) {
                acc[key] = curr[key];
            }
            return acc;
        }, {});
    }
}
