import { Injectable } from '@angular/core';
import {BehaviorSubject, mergeMap} from "rxjs";
import {ConstService} from "./const.service";
import {AthleteService} from "./athlete.service";
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/compat/firestore";
import {Purchases} from "../../../../shared/interfaces/purchase.interface";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {filter, flatMap} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class StoreService {

  public myPurchases = new BehaviorSubject<Purchases>({});
  public myPurchases$ = this.myPurchases.asObservable();
  private purchasesCollection: AngularFirestoreCollection<Purchases>;

  constructor(private db: AngularFirestore,
              private http: HttpClient,
              private athleteService: AthleteService) {
    this.purchasesCollection = db.collection(ConstService.CONST.COLLECTIONS.PURCHASES);
    this.athleteService.myId.pipe(
        filter((myId: string) => !!myId),
        mergeMap((myId: string) => this.purchasesCollection.doc(myId).valueChanges())
    ).subscribe((purchases) => {
      this.myPurchases.next(purchases || {});
    });
  }

  buyItem(itemId: string) {
    return this.http.post(`${environment.baseBE}/store/buy`, {itemId});
  }
}
