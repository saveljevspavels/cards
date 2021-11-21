import {Injectable} from "@angular/core";
import {CONST} from "../app.module";


@Injectable()
export class UtilService {
    static generateId = () => {
        return Math.random().toString(36).substring(7);
    }

    static normalizeActivityType = (type: string): any => {
        return Object.values(CONST.ACTIVITY_TYPES).find((activityType: any) => type.toUpperCase().indexOf(activityType.toUpperCase()) !== -1)
    }
}
