import {ElementRef, Injectable, TemplateRef} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {filter, take} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class PopupService {

    private _popup = new BehaviorSubject<ElementRef | null>(null)
    public popup$ = this._popup.asObservable()

    public showPopup(template: ElementRef, timeout = 0) {
        this.popup = template;
        if(timeout) {
            setTimeout(() => this.closePopup(), timeout)
        }
        return this.popup$.pipe(filter((res) => res === null), take(1));
    }

    public closePopup() {
        this.popup = null;
    }

    public set popup(popup: ElementRef | null) {
        this._popup.next(popup);
    }

    public get popup(): ElementRef | null {
        return this._popup.value;
    }

    constructor() {
        this.popup$.subscribe((popup) =>{
            if(popup) {
                document.body.classList.add('no-scroll')
            } else {
                document.body.classList.remove('no-scroll')
            }
        })
    }
}
