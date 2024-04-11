import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {ConstService} from "./const.service";
import {Achievement} from "../interfaces/achievement";
import {filter, map} from "rxjs/operators";
import {UtilService} from "./util.service";
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/compat/firestore";

@Injectable({
  providedIn: 'root'
})
export class AchievementService {

    public achievements = new BehaviorSubject<Achievement[]>([]);
    private readonly achievementCollection: AngularFirestoreCollection;

    constructor(private db: AngularFirestore,
                private http: HttpClient) {
        this.achievementCollection = this.db.collection(ConstService.CONST.COLLECTIONS.ACHIEVEMENTS);
        this.achievementCollection.valueChanges().subscribe((achievements: any[]) => {
            this.achievements.next(UtilService.sortByProp(achievements as any[]))
        });
    }

    getAchievements(achievementIds: string[]): Observable<(Achievement | null)[]> {
        return this.achievements.pipe(
            filter((achievements) => !!achievements.length),
            map((achievements) => {
                return achievements.map(item => {
                    item.timesCompleted = achievementIds.filter(id => id === item.id).length;
                    return item;
                })
            }
        ))
    }

    createAchievement(achievement: Achievement) {
        return this.http.post(`${environment.baseBE}/create-achievement`, achievement)
    }

    deleteAchievement(achievementId: string) {
        return this.http.post(`${environment.baseBE}/delete-achievement`, {
            achievementId
        })
    }

    assignAchievement(athleteId: string | null, achievementId: string) {
        return this.http.post(`${environment.baseBE}/assign-achievement`, {
            athleteId,
            achievementId
        })
    }

}
