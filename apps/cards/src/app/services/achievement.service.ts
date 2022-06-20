import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {AngularFirestore} from "@angular/fire/firestore";
import {LocalStorageService} from "./local-storage.service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import Hand from "../interfaces/hand";
import {ConstService} from "./const.service";
import {Achievement} from "../interfaces/achievement";
import {filter, map} from "rxjs/operators";
import {UtilService} from "./util.service";

@Injectable({
  providedIn: 'root'
})
export class AchievementService {

    public achievements = new BehaviorSubject<Achievement[]>([]);
    private achievementCollection = this.db.collection(ConstService.CONST.COLLECTIONS.ACHIEVEMENTS);

    constructor(private db: AngularFirestore,
                private http: HttpClient) {
        this.achievementCollection.valueChanges().subscribe((achievements: any[]) => {
            this.achievements.next(achievements)
        });
    }

    getAchievements(achievementIds: string[]): Observable<(Achievement | null)[]> {
        return this.achievements.pipe(
            filter((achievements) => !!achievements.length),
            map((achievements) => {
                return UtilService.sortByProp(achievements.map(item => {
                    item.timesCompleted = achievementIds.filter(id => id === item.id).length;
                    return item;
                }))
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

    assignAchievement(athleteId: string, achievementId: string) {
        return this.http.post(`${environment.baseBE}/assign-achievement`, {
            athleteId,
            achievementId
        })
    }

}
