import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {Activity} from "../../../../shared/interfaces/activity.interface";

@Injectable({
    providedIn: 'root'
})
export class BoardService {
    private _selectedActivity = new BehaviorSubject<Activity | null>(null);
    public selectedActivity$ = this._selectedActivity.asObservable();

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
