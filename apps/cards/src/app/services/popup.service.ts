import {ElementRef, Injectable, TemplateRef} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {filter} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class PopupService {

    private _popup = new BehaviorSubject<ElementRef | null>(null)
    public popup$ = this._popup.asObservable()

    public showPopup(template: ElementRef, timeout = 0) {
        this.popup = template;
        if(timeout) {
            setTimeout(() => this.popup = null, timeout)
        }
        return this.popup$.pipe(filter((res) => res === null));
    }

    public set popup(popup: ElementRef | null) {
        this._popup.next(popup);
    }

    public get popup(): ElementRef | null {
        return this._popup.value;
    }

    constructor() { }
}
