import firebase from "firebase";
import {
    generateId,
    getRandomInt,
    getTier,
    normalizeActivityType,
    tierToRoman,
    updateScoreValues
} from "./helpers/util";
import {RESPONSES} from "./response-codes";
import fs from "fs";
import schedule from "node-schedule";
import {Logger} from "winston";
import {CONST} from "../../definitions/constants";
import {RULES} from "../../definitions/rules";
import Card from "../shared/interfaces/card.interface";
import Athlete from "../shared/interfaces/athlete.interface";
import WhereFilterOp = firebase.firestore.WhereFilterOp;

export class FirestoreService {
    logger: Logger;

    db: firebase.firestore.Firestore = firebase.initializeApp(
        JSON.parse(fs.readFileSync(
            `definitions/firebaseConfig${process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''}.json`,
            'utf8'))
    ).firestore();

    public athleteCollection = new DataCollection<Athlete>(this.db, CONST.COLLECTIONS.ATHLETES)
    public pendingActivityCollection = this.db.collection(CONST.COLLECTIONS.PENDING_ACTIVITIES)
    public detailedActivityCollection = this.db.collection(CONST.COLLECTIONS.DETAILED_ACTIVITIES)
    public commandCollection = this.db.collection(CONST.COLLECTIONS.COMMANDS)
    public handCollection = this.db.collection(CONST.COLLECTIONS.HANDS)
    public cardCollection = new DataCollection<Card>(this.db, CONST.COLLECTIONS.CARDS)
    public cardFactoryCollection = this.db.collection(CONST.COLLECTIONS.CARD_FACTORIES)
    public achievementCollection = this.db.collection(CONST.COLLECTIONS.ACHIEVEMENTS)
    public scoreCollection = this.db.collection(CONST.COLLECTIONS.SCORES)
    public gameCollection = this.db.collection(CONST.COLLECTIONS.GAME)
    public sessionCollection = this.db.collection(CONST.COLLECTIONS.SESSIONS)
    public schemeCollection = this.db.collection(CONST.COLLECTIONS.SCHEME)

    constructor(logger: Logger) {
        this.logger = logger;
        Object.getOwnPropertyNames(FirestoreService.prototype).forEach(method => {
            if(['constructor', 'errorHandlerWrap'].indexOf(method) === -1) {
                // @ts-ignore
                this[method] = this.errorHandlerWrap(method, this[method]);
            }
        })

        const rule = new schedule.RecurrenceRule();
        rule.hour = 21;
        rule.minute = 0;
        rule.tz = 'Etc/UTC';

        const job = schedule.scheduleJob(rule, async () => {
            this.logger.error(`It's midnight`);
            await this.restoreAthletesEnergy(RULES.ENERGY.TIMED_RESTORE);
        })
    }

    errorHandlerWrap(methodName: string, method: any) {
        return async (...args: any[]) => {
            try {
                return await method.bind(this).call(this, ...args)
            } catch (err) {
                this.logger.error(methodName, err)
            }

        }
    }

    addPendingActivity(activity: any){
        return this.pendingActivityCollection.doc(activity.object_id.toString()).set(activity)
            .then(() => {
                this.logger.info(`Pending activity ${activity.object_id.toString()} added!`);
            })
            .catch((error) => {
                this.logger.error(`Error writing document: ${error}`);
            });
    }

    deletePendingActivity(activityId: string) {
        return this.pendingActivityCollection.doc(activityId.toString()).delete()
            .then(() => {
                // this.logger.info(`Pending activity ${activityId.toString()} deleted!`); // Too much spam
            })
            .catch((error) => {
                this.logger.error(`Error deleting document: ${error}`);
            });
    }

    async addDetailedActivity(activity: any) {
        const activityDoc = this.detailedActivityCollection.doc(activity.id.toString())
        const activityExists = (await activityDoc.get()).exists
        if(activityExists) {
            // this.logger.error(`Activity ${activity.id} already exists`); Too much spam
        } else {
            this.logger.info(`Activity ${activity.id} added for athlete ${activity.athlete.id}`);
            return this.detailedActivityCollection.doc(activity.id.toString()).set(activity)
        }
    }

    async addCommand(athleteId: string, command: any) {
        const id = generateId();
        return this.commandCollection.doc(id).set({
            athleteId,
            id,
            ...command
        })
        .then(() => {
            this.logger.info(`Command ${command.type} added for ${athleteId}!`);
        })
        .catch((error) => {
            this.logger.error(`Error writing document: ${error}`);
        });
    }

    async deleteCommand(commandId: string) {
        return this.commandCollection.doc(commandId).delete()
            .then(() => {
                this.logger.info(`Command ${commandId} deleted!`);
            })
            .catch((error) => {
                this.logger.error(`Error writing document: ${error}`);
            });
    }

    async deleteCards(cards: any[]) {
        const handsToCheck = ['deck', 'discard', 'queue']
        for(let i = 0; i < handsToCheck.length; i++) {
            // @ts-ignore
            const handDocument = this.handCollection.doc(CONST.HANDS[handsToCheck[i].toUpperCase()]);
            const currentHand = (await handDocument.get()).data()?.cardIds || []
            cards.forEach((card: any) => {
                if(currentHand.indexOf(card) !== -1) {
                    currentHand.splice(currentHand.indexOf(card), 1);
                    this.logger.info(`Card ${card} deleted from ${handsToCheck[i]}`)
                }
            })
            await handDocument.set({cardIds: currentHand})
        }
        for(let i = 0; i < cards.length; i++) {
            await this.cardCollection.delete(cards[i]);
        }
        this.logger.info(`Cards ${cards} deleted`)
    }

    async submitActivity(activityId: string, cardIds: string[], imageIds: string[], comments: string) {
        const activityDoc = this.detailedActivityCollection.doc(activityId.toString())
        const activity = (await activityDoc.get()).data() || {}
        const athlete = await this.athleteCollection.get(activity.athlete.id.toString());

        if(!athlete) {
            return;
        }

        if(activity.gameData.status !== CONST.ACTIVITY_STATUSES.NEW
            && activity.gameData.status !== CONST.ACTIVITY_STATUSES.REJECTED) {
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} submitted activity ${activityId} with invalid status ${activity.gameData.status}`)
            return RESPONSES.ERROR.WRONG_ACTIVITY_STATUS
        }

        if(cardIds.length > RULES.MAX_CARDS_SUBMIT) {
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} submitted activity with too many cards ${cardIds}`)
            return RESPONSES.ERROR.MAX_CARDS_SUBMIT
        }

        const cardQuery = this.cardCollection.collection.where('id', 'in', cardIds)
        const cardDocs = await cardQuery.get()
        const cardSnapshots: any[] = [];
        cardDocs.forEach((card) => {
            const cardSnapshot = card.data();
            cardSnapshots.push(cardSnapshot)
        })

        await activityDoc.set({
            ...activity,
            gameData: {
                status: CONST.ACTIVITY_STATUSES.SUBMITTED,
                submittedAt: new Date().toISOString(),
                cardIds,
                cardSnapshots, // Storing card snapshots
                images: imageIds,
                comments
            }
        })
        // await this.discardCards(athleteId, cardIds) // No discarding in current game mode
        this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} submitted activity with ${cardIds}`)
        return RESPONSES.SUCCESS
    }

    async rejectActivity(activityId: string, comments: string) {
        const activityDoc = this.detailedActivityCollection.doc(activityId.toString())
        const activity = (await activityDoc.get()).data() || {}
        await activityDoc.update({
            gameData: {
                ...activity.gameData,
                cardSnapshots: [],
                cardIds: [],
                images: [],
                comments,
                status: CONST.ACTIVITY_STATUSES.NEW,
            }
        })
        this.logger.info(`Activity ${activity.type} ${activityId} was rejected for athlete ${activity.athlete.id.toString()}`)
    }

    async deleteActivity(activityId: string) {
        const activityDoc = this.detailedActivityCollection.doc(activityId.toString())
        const activity = (await activityDoc.get()).data() || {}
        await activityDoc.update({
            gameData: {
                ...activity.gameData,
                cardSnapshots: [],
                cardIds: [],
                status: CONST.ACTIVITY_STATUSES.DELETED,
            }
        })
        this.logger.info(`Activity ${activityId} was deleted for athlete ${activity.athlete.id.toString()}`)
    }

    async spendEnergy(athleteId: string, cardIds: string[]) {
        let energySpent = 0;
        if(cardIds?.length) {
            const itemQuery = this.cardCollection.collection.where('id', 'in', cardIds)
            const itemDocs = await itemQuery.get()
            itemDocs.forEach(item => {
                energySpent = energySpent + getTier(item.data().value.energyCost);
            })
        }

        const athlete = await this.athleteCollection.get(athleteId.toString());

        if(athlete) {
            const newVal = Math.max((athlete.energy || 0) - energySpent, 0);
            await this.athleteCollection.update(
                athleteId.toString(),
                {
                    energy: newVal
                }
            )
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} spent ${energySpent} energy, now ${newVal}`)
            return true;
        } else {
            this.logger.info(`Athlete ${athleteId} doesn't exist`)
            return false;
        }
    }

    async updateScore(athleteId: string, cardIds: string[], achievementIds: string[]) {
        const scoreDoc = this.scoreCollection.doc(athleteId.toString())
        const score = (await scoreDoc.get()).data() || {}
        const calculateTotals = async (ids: string[], collection: any) => {
            const items: any[] = [];
            const value = 0;
            if(ids?.length) {
                const itemQuery = collection.where('id', 'in', ids)
                const itemDocs = await itemQuery.get()
                itemDocs.forEach((item: any) => {
                    items.push(item.data())
                })
                items.reduce((acc, item) => {
                    acc = acc + item.value;
                    return acc;
                }, value);
            }
            return {
                amount: items.length || 0,
                total: value
            }
        }

        const cardTotals = calculateTotals(cardIds, this.cardCollection.collection);
        const achievementTotals = calculateTotals(achievementIds, this.achievementCollection);
        const newScore = updateScoreValues(
            score,
            (await cardTotals).total + (await achievementTotals).total,
            (await cardTotals).amount,
            (await achievementTotals).amount
        )
        await scoreDoc.set({
            ...newScore,
            athleteId: athleteId
        });

        this.logger.info(`Athlete ${athleteId} new score: ${JSON.stringify(newScore)}, was ${JSON.stringify(score)}`)
    }

    async updateCardValues(cardIds: string[]) {
        if(!cardIds.length) {
            this.logger.error(`No cardIds for updateCardValues`)
            return;
        }

        for(let i = 0; i < cardIds.length; i++) {
            const card: Card | null = await this.cardCollection.get(cardIds[i])
            if(card === null) continue;

            let cardUses = card.cardUses.queue;
            if(card.value >= 7 && cardUses > 0) { // Additional point dump
                cardUses = cardUses + 1;
            }
            const valueDelta = (RULES.CARD_VALUE_STEP * (1 - cardUses));
            const newValue = card.value + valueDelta;
            await this.cardCollection.update(
                cardIds[i],
                {
                    value: newValue < RULES.CARD_VALUE_MIN ? RULES.CARD_VALUE_MIN : newValue > RULES.CARD_VALUE_MAX ? RULES.CARD_VALUE_MAX : newValue,
                    cardUses: {
                        ...card.cardUses,
                        queue: 0
                    }
                }
            );
            this.logger.info(`Card ${card.id} (${card.title}) value changed by ${valueDelta}, now ${newValue}`)
        }
    }

    async restoreAthletesEnergy(value: number) {
        const allAthletes = await this.athleteCollection.all();
        allAthletes.forEach((athlete) => {
            const excessEnergy = ((athlete.energy || 0) + value) - RULES.ENERGY.MAX;
            const newVal = Math.min((athlete.energy || 0) + value, RULES.ENERGY.MAX)
            this.athleteCollection.update(
                athlete.id.toString(),
                {
                    energy: newVal,
                    coins: (athlete.coins || 0) + (excessEnergy > 0 ? excessEnergy * RULES.COINS.PER_ENERGY_CONVERSION : 0)
                }
            )
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} restored ${value} energy, now ${newVal}, and ${(excessEnergy > 0 ? excessEnergy * RULES.COINS.PER_ENERGY_CONVERSION : 0)} coins`)
        })
    }

    async updateBaseWorkout(athleteIds: string[], baseWorkoutPatch: any) {
        const athletes = await this.athleteCollection.where('id', 'in', athleteIds)
        athletes.forEach((athlete) => {
            const currentBaseWorkout = athlete.baseWorkout;
            this.athleteCollection.update(
                athlete.id,
                {
                    baseWorkout: {
                        ...currentBaseWorkout,
                        ...Object.keys(baseWorkoutPatch).reduce((acc: any, type) => {
                            // @ts-ignore
                            acc[type] = {...currentBaseWorkout[type], ...baseWorkoutPatch[type]}
                            return acc;
                        }, {})
                    }
                }
            )
            this.logger.info(`Base workout updated for ${athlete.firstname} ${athlete.lastname} ${athlete.id} with ${JSON.stringify(baseWorkoutPatch)}`)
        })
    }

    async setPermissions(athleteIds: string[], permissions: string[]) {
        for(let id of athleteIds) {

            await this.athleteCollection.update(id.toString(),
            {
                permissions
            })
        }
    }

    async startGame() {
        const gameDoc = this.gameCollection.doc(CONST.GAME_ID)
        const game = (await gameDoc.get()).data() || {}
        await gameDoc.set({
            cardUses: 0,
            shifts: 0,
            startDate: game.startDate
        })
    }


    async createAchievement(achievement: any) {
        const id = achievement.id || generateId()
        return this.achievementCollection.doc(id).set({
            ...achievement,
            id
        })
            .then(() => {
                this.logger.info(`New achievement ${achievement.title} ${achievement.id} created!`);
            })
            .catch((error) => {
                this.logger.error(`Error writing document: ${error}`);
            });
    }

    deleteAchievement(achievementId: string) {
        return this.achievementCollection.doc(achievementId.toString()).delete()
            .then(() => {
                this.logger.info(`Achievement ${achievementId.toString()} deleted!`); // Too much spam
            })
            .catch((error) => {
                this.logger.error(`Error deleting document: ${error}`);
            });
    }

    async assignAchievement(athleteId: string, achievementId: string) {
        const athlete = await this.athleteCollection.get(athleteId.toString());

        if(athlete) {
            await this.athleteCollection.update(
                athleteId.toString(),
                {
                    achievements: [...(athlete.achievements || []), achievementId]
                })
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} got new achievement ${achievementId}`)
            return true;
        } else {
            this.logger.info(`Athlete ${athleteId} doesn't exist`)
            return false;
        }
    }

}

export class DataCollection<T> {
    private readonly _collection: firebase.firestore.CollectionReference<{ [field: string]: T }>;
    constructor(
        private db: firebase.firestore.Firestore,
        private collectionName: string
    ) {
        this._collection = this.db.collection(collectionName);
    }

    get collection() {
        return this._collection;
    }

    async get(documentName: string): Promise<T | null> {
        return (await this._collection.doc(documentName).get()).data() as T | undefined || null;
    }

    async all(): Promise<T[] | []> {
        return (await this._collection.doc().get()).data() as T[] | undefined || [];
    }

    async exists(documentName: string): Promise<boolean> {
        return (await this._collection.doc(documentName).get()).exists;
    }

    async set(documentName: string, value: T): Promise<void> {
        return (await this._collection.doc(documentName).set(value as unknown as { [field: string]: T }))
    }

    async update(documentName: string, value: any): Promise<void> {
        return (await this._collection.doc(documentName).update(value))
    }

    async delete(documentName: string): Promise<void> {
        return (await this._collection.doc(documentName).delete())
    }

    async where(fieldPath: string, opStr: string, value: any): Promise<T[] | []> {
        return (await (await this._collection.where(fieldPath, opStr as WhereFilterOp, value)).get()).docs.map(doc => doc.data()) as unknown as T[] || []
    }
}