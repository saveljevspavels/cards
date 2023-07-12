import firebase from "firebase";
import {
    generateId,
    getRandomInt,
    getTier,
} from "./helpers/util";
import fs from "fs";
import schedule from "node-schedule";
import {Logger} from "winston";
import {CONST} from "../../definitions/constants";
import {RULES} from "../../definitions/rules";
import Card from "../shared/interfaces/card.interface";
import Athlete from "../shared/interfaces/athlete.interface";
import WhereFilterOp = firebase.firestore.WhereFilterOp;
import Score from "../shared/interfaces/score.interface";
import Game from "../cards/src/app/interfaces/game";
import CardFactory from "../shared/interfaces/card-factory.interface";

export class FirestoreService {
    logger: Logger;

    db: firebase.firestore.Firestore = firebase.initializeApp(
        JSON.parse(fs.readFileSync(
            `definitions/firebaseConfig${process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''}.json`,
            'utf8'))
    ).firestore();

    public athleteCollection = new DataCollection<Athlete>(this.db, CONST.COLLECTIONS.ATHLETES)
    public pendingActivityCollection = this.db.collection(CONST.COLLECTIONS.PENDING_ACTIVITIES)
    public detailedActivityCollection = new DataCollection<any>(this.db, CONST.COLLECTIONS.DETAILED_ACTIVITIES);
    public commandCollection = this.db.collection(CONST.COLLECTIONS.COMMANDS)
    public handCollection = this.db.collection(CONST.COLLECTIONS.HANDS)
    public cardCollection = new DataCollection<Card>(this.db, CONST.COLLECTIONS.CARDS)
    public cardFactoryCollection = new DataCollection<CardFactory>(this.db, CONST.COLLECTIONS.CARD_FACTORIES)
    public achievementCollection = this.db.collection(CONST.COLLECTIONS.ACHIEVEMENTS)
    public scoreCollection = new DataCollection<Score>(this.db, CONST.COLLECTIONS.SCORES)
    public gameCollection = new DataCollection<Game>(this.db, CONST.COLLECTIONS.GAME)
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
        if(await this.detailedActivityCollection.exists(activity.id.toString())) {
            // this.logger.error(`Activity ${activity.id} already exists`); Too much spam
        } else {
            this.logger.info(`Activity ${activity.id} added for athlete ${activity.athlete.id}`);
            return await this.detailedActivityCollection.set(activity.id.toString(), activity)
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

    async updateBaseWorkout(athleteIds: string[], baseWorkoutPatch: any) {
        const athletes = await this.athleteCollection.where([{ fieldPath: 'id', opStr: 'in', value: athleteIds}])
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
        const game: Game = {
            cardUses: 0,
            shifts: 0,
            startDate: new Date().toISOString().slice(0, 10),
            featuredCard: null
        }
        await this.gameCollection.set(
            CONST.GAME_ID,
            game
        )
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
        return (await this._collection.get()).docs.map(doc => doc.data()) as unknown as T[] | undefined || [];
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

    async where(params: {fieldPath: string, opStr: string, value: any}[]): Promise<T[] | []> {
        const query = params.reduce((query, paramSet) =>
            query.where(paramSet.fieldPath, paramSet.opStr as WhereFilterOp, paramSet.value),
            (await this._collection.get()).query
        )
        return (await query.get()).docs.map(doc => doc.data()) as unknown as T[] || []
    }
}