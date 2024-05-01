import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/compat/firestore";
import {HttpClient} from "@angular/common/http";
import {ConstService} from "./const.service";
import {ProgressiveChallenge} from "../../../../shared/interfaces/progressive-challenge.interface";
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ChallengeService {

    public challenges = new BehaviorSubject<ProgressiveChallenge[]>([]);
    private challengeCollection: AngularFirestoreCollection;

    constructor(
        private db: AngularFirestore,
        private http: HttpClient,
    ) {
        this.challengeCollection = this.db.collection(ConstService.CONST.COLLECTIONS.CHALLENGES);
        this.challengeCollection.valueChanges().subscribe((challenges: any) => {
            this.challenges.next(challenges as ProgressiveChallenge[]);
        });
    }

    createChallenge(challenge: ProgressiveChallenge) {
        return this.http.post(`${environment.baseBE}/challenges/create`, {
            challenge
        })
    }
}
