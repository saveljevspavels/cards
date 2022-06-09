import {Injectable} from "@angular/core";
import {ConstService} from "./const.service";


@Injectable()
export class UtilService {

    static generateId = () => {
        return Math.random().toString(36).substring(7);
    }

    static normalizeActivityType = (type: string): any => {
        return Object.values(ConstService.CONST.ACTIVITY_TYPES).find((activityType: any) => type.toUpperCase().indexOf(activityType.toUpperCase()) !== -1) || ConstService.CONST.ACTIVITY_TYPES.OTHER
    }

    static getFlatKeys(object: any): any {
        const properties: any = Object.values(object)
            .reduce(
                (acc: any, properties: any) => [...acc, ...Object.keys(properties)],
                []
            )
        return properties.filter((item: any, i: number) => {
            return properties.indexOf(item) === i;
        })
    }
}
