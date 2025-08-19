import {Injectable} from "@angular/core";
import {ConstService} from "./const.service";
import {LocalStorageService} from "./local-storage.service";

@Injectable()
export class UtilService {

    static noSort = () => 0;

    static generateId = () => {
        return Math.random().toString(36).substring(7);
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

    static saveState(state: string | boolean, item: string) {
        const obj: any = {};
        obj[item] = state;
        LocalStorageService.setObject(obj);
    }

    static getTier(value: number) {
        if(value >= ConstService.RULES.CARD_LEVELS["0"].min && value <= ConstService.RULES.CARD_LEVELS["0"].max) return 0
        if(value >= ConstService.RULES.CARD_LEVELS["1"].min && value <= ConstService.RULES.CARD_LEVELS["1"].max) return 1
        if(value >= ConstService.RULES.CARD_LEVELS["2"].min && value <= ConstService.RULES.CARD_LEVELS["2"].max) return 2
        if(value >= ConstService.RULES.CARD_LEVELS["3"].min && value <= ConstService.RULES.CARD_LEVELS["3"].max) return 3
        if(value >= ConstService.RULES.CARD_LEVELS["4"].min && value <= ConstService.RULES.CARD_LEVELS["4"].max) return 4
        return 0;
    }

    static sortByProp(array: any[], prop = 'title'){
        return array.sort((a, b) => {
            const textA = a[prop].toUpperCase();
            const textB = b[prop].toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
    }

    static async retry<T>(
        fn: () => Promise<T>,
        retries = 3,
        delayMs = 500,
        backoff = false
    ): Promise<T> {
        let lastError: any;
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                return await fn();
            } catch (err) {
                lastError = err;
                if (attempt < retries - 1) {
                    const waitTime = backoff ? delayMs * Math.pow(2, attempt) : delayMs;
                    await new Promise(res => setTimeout(res, waitTime));
                }
            }
        }
        throw lastError;
    }
}
