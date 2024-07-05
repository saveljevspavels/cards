import {CONST} from "../../../definitions/constants";
import {Purchases} from "../interfaces/purchase.interface";

export class StoreHelperService {
    static getServerDate() {
        const date = new Date();
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const offsetDate = new Date(utc + (3600000 * CONST.TIMEZONE_OFFSET));
        return `${offsetDate.getFullYear()}-${offsetDate.getMonth() + 1}-${offsetDate.getDate()}`;
    }

    static getItemStock(itemId: string, purchases: Purchases): number {
        const ITEM_STOCK = 1;
        const todaysPurchases: {[itemId: string]: number} = purchases[StoreHelperService.getServerDate()] || {};
        return ITEM_STOCK - (todaysPurchases[itemId] || 0);
    }
}