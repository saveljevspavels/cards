import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {Logger} from "winston";
import {CONST} from "../../definitions/constants";
import AthleteService from "./athlete.service";
import {STORE_ITEMS} from "../../definitions/storeItems";
import {Purchases} from "../shared/interfaces/purchase.interface";
import {StoreHelperService} from "../shared/services/store.helper.service";
import Athlete from "../shared/classes/athlete.class";
import {StoreItem} from "../shared/interfaces/store-item.interface";
import {ChallengeService} from "./challenge.service";
export class StoreService {
    constructor(
        private app: Express,
        private firebaseService: FirestoreService,
        private logger: Logger,
        private athleteService: AthleteService,
        private challengeService: ChallengeService
    ) {
        app.post(`${CONST.API_PREFIX}/store/buy`, async (req, res) => {
            const itemId = req.body?.itemId;
            const athleteId = res.get('athleteId');
            if(!itemId || !athleteId) {
                res.status(400).send('Item Id or Athlete Id missing');
                return;
            }
            try {
                const price = await this.buyItem(itemId, athleteId);
                await this.challengeService.progressCoinChallenge(athleteId, price);
                res.status(200).send({});
            } catch (err) {
                this.logger.error(`Error buying item ${err}`);
                res.status(400).send({});
            }
        });
    }

    async buyItem(itemId: string, athleteId: string): Promise<number> {
        const athlete = await this.athleteService.getAthlete(athleteId);
        const item = STORE_ITEMS.find((item) => item.id === itemId);
        if(!item) {
            throw new Error(`Item ${itemId} not found`);
        }
        const purchases = await this.getCurrentPurchases(athleteId);
        if(StoreHelperService.getItemStock(itemId, purchases) <= 0) {
            throw new Error(`Item ${item.name} out of stock`);
        }

        const finalPrice = this.getFinalPrice(item, athlete);
        athlete.spendCoins(finalPrice);
        athlete.addCurrencies(item.rewards);

        await Promise.all([
            this.athleteService.updateAthlete(athlete),
            this.addItemToPurchases(itemId, purchases, athleteId)
        ]);
        this.logger.info(`Athlete ${athleteId} bought item ${item.name} for ${finalPrice} coins`);
        return finalPrice;
    }

    getFinalPrice(item: StoreItem, athlete: Athlete) {
        if(!item.discountBy || !item.discount) {
            return item.price;
        }
        return item.price - (athlete.getPerkLevel(item.discountBy) * item.discount);
    }

    async getCurrentPurchases(athleteId: string): Promise<Purchases> {
        const purchases: Purchases = await this.firebaseService.purchaseCollection.get(athleteId) || {};
        return purchases;
    }

    async addItemToPurchases(itemId: string, purchases: Purchases, athleteId: string) {
        const todaysPurchases = purchases[StoreHelperService.getServerDate()] || {};
        todaysPurchases[itemId] = (todaysPurchases[itemId] || 0) + 1;
        purchases[StoreHelperService.getServerDate()] = todaysPurchases;
        await this.firebaseService.purchaseCollection.set(athleteId, purchases);
    }
}