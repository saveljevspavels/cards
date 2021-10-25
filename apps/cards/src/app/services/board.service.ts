import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class BoardService {
    private _selectedActivity = new BehaviorSubject(null)
    public selectedActivity$ = this._selectedActivity.asObservable()

    public set activity(activity: any) {
        this._selectedActivity.next(activity)
    }

    public get activity() {
        return this._selectedActivity.value
    }

    public deselectActivity() {
        this.activity = null;
    }
}
