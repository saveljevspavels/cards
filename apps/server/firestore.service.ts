import {
    generateId,
} from "./helpers/util";
import fs from "fs";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import {getFirestore} from "firebase/firestore";
import {initializeApp} from "firebase/app";
import 'firebase/compat/firestore';
import {Logger} from "winston";
import {CONST} from "../../definitions/constants";
import Card from "../shared/interfaces/card.interface";
import Athlete from "../shared/classes/athlete.class";
import WhereFilterOp = firebase.firestore.WhereFilterOp;
import Score from "../shared/interfaces/score.interface";
import Game from "../cards/src/app/interfaces/game";
import CardFactory from "../shared/interfaces/card-factory.interface";
import {collection, deleteDoc, doc, Firestore, getDoc, getDocs, setDoc, updateDoc, query, where} from "firebase/firestore";
import CollectionReference = firebase.firestore.CollectionReference;
import {ProgressiveChallenge} from "../shared/interfaces/progressive-challenge.interface";
import {ChallengeProgress} from "../shared/classes/challenge-progress";
import {JsonObjectInterface} from "../shared/interfaces/json-object.interface";
import {Purchases} from "../shared/interfaces/purchase.interface";

export class FirestoreService {
    logger: Logger;
    firebaseApp;
    db;

    public athleteCollection: DataCollection<Athlete>;
    public pendingActivityCollection: DataCollection<any>;
    public detailedActivityCollection: DataCollection<any>;
    public commandCollection: DataCollection<any>;
    public handCollection: DataCollection<any>;
    public cardCollection: DataCollection<Card>;
    public cardFactoryCollection: DataCollection<CardFactory>;
    public achievementCollection: DataCollection<ProgressiveChallenge>;
    public scoreCollection: DataCollection<Score>;
    public gameCollection: DataCollection<Game>;
    public sessionCollection: DataCollection<any>;
    public schemeCollection: DataCollection<any>;
    public challengeCollection: DataCollection<ProgressiveChallenge>;
    public challengeProgressCollection: DataCollection<ChallengeProgress>;
    public purchaseCollection: DataCollection<Purchases>;

    constructor(logger: Logger) {
        this.logger = logger;
        this.firebaseApp = initializeApp(
            JSON.parse(fs.readFileSync(
                `definitions/firebaseConfig${process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''}.json`,
                'utf8'))
        )
        this.db = getFirestore(this.firebaseApp);
        Object.getOwnPropertyNames(FirestoreService.prototype).forEach(method => {
            if (['constructor', 'errorHandlerWrap'].indexOf(method) === -1) {
                // @ts-ignore
                this[method] = this.errorHandlerWrap(method, this[method]);
            }
        });

        this.athleteCollection = new DataCollection<Athlete>(this.db, CONST.COLLECTIONS.ATHLETES);
        this.pendingActivityCollection = new DataCollection<any>(this.db, CONST.COLLECTIONS.PENDING_ACTIVITIES);
        this.detailedActivityCollection = new DataCollection<any>(this.db, CONST.COLLECTIONS.DETAILED_ACTIVITIES);
        this.commandCollection = new DataCollection<any>(this.db, CONST.COLLECTIONS.COMMANDS);
        this.handCollection = new DataCollection<any>(this.db, CONST.COLLECTIONS.HANDS);
        this.cardCollection = new DataCollection<Card>(this.db, CONST.COLLECTIONS.CARDS);
        this.cardFactoryCollection = new DataCollection<CardFactory>(this.db, CONST.COLLECTIONS.CARD_FACTORIES);
        this.achievementCollection = new DataCollection<any>(this.db, CONST.COLLECTIONS.ACHIEVEMENTS);
        this.scoreCollection = new DataCollection<Score>(this.db, CONST.COLLECTIONS.SCORES);
        this.gameCollection = new DataCollection<Game>(this.db, CONST.COLLECTIONS.GAME);
        this.sessionCollection = new DataCollection<any>(this.db, CONST.COLLECTIONS.SESSIONS);
        this.schemeCollection = new DataCollection<any>(this.db, CONST.COLLECTIONS.SCHEME);
        this.challengeCollection = new DataCollection<any>(this.db, CONST.COLLECTIONS.CHALLENGES);
        this.challengeProgressCollection = new DataCollection<ChallengeProgress>(this.db, CONST.COLLECTIONS.CHALLENGE_PROGRESS);
        this.purchaseCollection = new DataCollection<Purchases>(this.db, CONST.COLLECTIONS.PURCHASES);
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
        return this.pendingActivityCollection.set(activity.object_id.toString(), activity)
            .then(() => {
                this.logger.info(`Pending activity ${activity.object_id.toString()} added!`);
            })
            .catch((error) => {
                this.logger.error(`Error writing document: ${error}`);
            });
    }

    deletePendingActivity(activityId: string) {
        return this.pendingActivityCollection.delete(activityId.toString())
            .then(() => {
                // this.logger.info(`Pending activity ${activityId.toString()} deleted!`); // Too much spam
            })
            .catch((error) => {
                this.logger.error(`Error deleting document: ${error}`);
            });
    }

    async addCommand(athleteId: string, command: any) {
        const id = generateId();
        return this.commandCollection.set(id, {
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
        return this.commandCollection.delete(commandId)
            .then(() => {
                this.logger.info(`Command ${commandId} deleted!`);
            })
            .catch((error) => {
                this.logger.error(`Error writing document: ${error}`);
            });
    }

    async deleteCards(cards: any[]) {
        const handsToCheck = ['deck', 'discard', 'queue']
        for (let i = 0; i < handsToCheck.length; i++) {
            // @ts-ignore
            const handDocument = doc(this.handCollection, CONST.HANDS[handsToCheck[i].toUpperCase()]);
            const currentHand = (await getDoc(handDocument)).data()?.cardIds || []
            cards.forEach((card: any) => {
                if (currentHand.indexOf(card) !== -1) {
                    currentHand.splice(currentHand.indexOf(card), 1);
                    this.logger.info(`Card ${card} deleted from ${handsToCheck[i]}`)
                }
            })
            await setDoc(handDocument, {cardIds: currentHand})
        }
        for (let i = 0; i < cards.length; i++) {
            await this.cardCollection.delete(cards[i]);
        }
        this.logger.info(`Cards ${cards} deleted`)
    }

    async setPermissions(athleteIds: string[], permissions: string[]) {
        for (let id of athleteIds) {

            await this.athleteCollection.update(id.toString(),
                {
                    permissions
                })
        }
    }

    async createAchievement(achievement: any) {
        const id = achievement.id || generateId()
        return this.achievementCollection.set(id, {
            ...achievement,
            id
        })
            .then(() => {
                this.logger.info(`New achievement ${achievement.title} ${achievement.id} created!`);
            })
            .catch((error: Error) => {
                this.logger.error(`Error writing document: ${error}`);
            });
    }

    deleteAchievement(achievementId: string) {
        return this.achievementCollection.delete(achievementId.toString())
            .then(() => {
                this.logger.info(`Achievement ${achievementId.toString()} deleted!`); // Too much spam
            })
            .catch((error: Error) => {
                this.logger.error(`Error deleting document: ${error}`);
            });
    }

    async assignAchievement(athleteId: string, achievementId: string) {
        const athlete = await this.athleteCollection.get(athleteId.toString());

        if (athlete) {
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
    private readonly _collection: CollectionReference<{ [field: string]: T }>;

    constructor(
        private db: Firestore,
        private collectionName: string
    ) {
        this._collection = collection(this.db, collectionName) as any;
    }

    get collection() {
        return this._collection;
    }

    async get(documentName: string): Promise<T | null> {
        return (await getDoc(doc(this._collection, documentName))).data() as T | undefined || null;
    }

    async all(): Promise<T[] | []> {
        return ((await getDocs(this._collection)).docs).map(doc => doc.data()) as unknown as T[] | undefined || [];
    }

    async exists(documentName: string): Promise<boolean> {
        return (await getDoc(doc(this._collection, documentName))).exists();
    }

    async set(documentName: string, value: T): Promise<void> {
        let valueToSet: any;
        try {
            valueToSet = (value as JsonObjectInterface).toJSONObject();
        } catch (e) {
            valueToSet = value;
        }
        return await setDoc(doc(this._collection, documentName), valueToSet as unknown as { [field: string]: T });
    }

    async update(documentName: string, value: any): Promise<void> {
        let valueToSet: any;
        try {
            valueToSet = (value as JsonObjectInterface).toJSONObject();
        } catch (e) {
            valueToSet = value;
        }
        return await updateDoc(doc(this._collection, documentName), valueToSet);
    }

    async delete(documentName: string): Promise<void> {
        return await deleteDoc(doc(this._collection, documentName));
    }

    async whereQuery(params: { fieldPath: string, opStr: string, value: any }[]): Promise<T[] | []> {
        const queryObj = params.reduce((queryObj, paramSet) =>
                query(queryObj, where(paramSet.fieldPath, paramSet.opStr as WhereFilterOp, paramSet.value)),
            query(this._collection)
        )
        return (await getDocs(query(queryObj))).docs.map((doc) => doc.data()) as unknown as T[] || []
    }
}