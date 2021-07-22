import {Injectable} from "@angular/core";


@Injectable()
export class UtilService {
    static generateId = () => {
        return Math.random().toString(36).substring(7);
    }
}
