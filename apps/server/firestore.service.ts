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
import {ValidationService} from "./shared/validation.service";
import fs from "fs";
import schedule from "node-schedule";
import {Logger} from "winston";
import {CONST} from "../../definitions/constants";
import {RULES} from "../../definitions/rules";

export class FirestoreService {
    logger: Logger;

    db = firebase.initializeApp(
        JSON.parse(fs.readFileSync(
            `definitions/firebaseConfig${process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''}.json`,
            'utf8'))
    ).firestore();

    public athleteCollection = this.db.collection(CONST.COLLECTIONS.ATHLETES)
    public pendingActivityCollection = this.db.collection(CONST.COLLECTIONS.PENDING_ACTIVITIES)
    public detailedActivityCollection = this.db.collection(CONST.COLLECTIONS.DETAILED_ACTIVITIES)
    public commandCollection = this.db.collection(CONST.COLLECTIONS.COMMANDS)
    public handCollection = this.db.collection(CONST.COLLECTIONS.HANDS)
    public cardCollection = this.db.collection(CONST.COLLECTIONS.CARDS)
    public cardFactoryCollection = this.db.collection(CONST.COLLECTIONS.CARD_FACTORIES)
    public achievementCollection = this.db.collection(CONST.COLLECTIONS.ACHIEVEMENTS)
    public scoreCollection = this.db.collection(CONST.COLLECTIONS.SCORES)
    public gameCollection = this.db.collection(CONST.COLLECTIONS.GAME)
    public sessionCollection = this.db.collection(CONST.COLLECTIONS.SESSIONS)

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

    async setDeck(cards: any[]) {
        const deck = this.handCollection.doc(CONST.HANDS.DECK);
        await deck.set({cardIds: cards})
    }

    async addToHand(hand: string, cards: any[]) {
        const handDoc = this.handCollection.doc(hand);
        const currentDeck = (await handDoc.get()).data()?.cardIds || []
        await handDoc.set({cardIds: [...cards, ...currentDeck || []]})
        this.logger.info(`Adding ${cards.length} cards to hand ${hand} (now ${currentDeck.length + cards.length})`)
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
            await this.cardCollection.doc(cards[i]).delete()
        }
        this.logger.info(`Cards ${cards} deleted`)
    }

    async shuffleDeck() {
        const deck = this.handCollection.doc(CONST.HANDS.DECK);
        const currentDeck = (await deck.get()).data()?.cardIds

        const shuffledDeck = []
        while(currentDeck.length) {
            const i = getRandomInt(currentDeck.length)
            shuffledDeck.push(...currentDeck.splice(i, 1))
        }

        await this.setDeck(shuffledDeck)
        this.logger.info(`Deck is shuffled, contains ${shuffledDeck.join(', ')} cards`)
    }

    async dealCards(athletes: any[], amount: number) {
        const deck = this.handCollection.doc(CONST.HANDS.DECK);
        const currentDeck = (await deck.get()).data()?.cardIds || []
        if(!amount) {
            amount = currentDeck.length;
        }
        this.logger.info(`Cards in deck: ${currentDeck.length} dealing ${amount * athletes.length} cards`)
        if(currentDeck.length >= amount * athletes.length) {
            const athleteCards: any = {}
            for(let i = 0; i < amount; i++) {
                athletes.forEach(athlete => {
                    if(!athleteCards[athlete]) {
                        athleteCards[athlete] = []
                    }
                    athleteCards[athlete].push(currentDeck.shift())
                })
            }
            Object.keys(athleteCards).forEach(key => {
                this.addToHand(key, athleteCards[key])
            })
            await deck.set({cardIds: currentDeck})
            return RESPONSES.SUCCESS;
        } else {
            this.logger.info(`Not enough cards in deck`)
            return RESPONSES.ERROR.NOT_ENOUGH_CARDS;
        }
    }

    async dealQueue() {
        const queueHand = this.handCollection.doc(CONST.HANDS.QUEUE);
        const currentQueue = (await queueHand.get()).data()?.cardIds || []
        this.logger.info(`There are ${currentQueue.length} cards in the queue, trying to draw a card`)
        // Queue length check is disabled, dealing all
        // if(currentQueue.length < RULES.QUEUE.LENGTH) {
        //     return await this.dealCards([CONST.HANDS.QUEUE], RULES.QUEUE.LENGTH - currentQueue.length);
        // } else {
        //     this.logger.info(`Queue hand is full (${currentQueue.length})`)
        //     return RESPONSES.ERROR.QUEUE_FULL
        // }
        return await this.dealCards([CONST.HANDS.QUEUE], 0);
    }

    async discardFromHand(hand: any, cards: any[]) {
        const handDoc = this.handCollection.doc(hand);
        const currentHand = (await handDoc.get()).data()?.cardIds || []
        const handSize = currentHand.length;
        cards.forEach(card => {
            const index = currentHand.indexOf(card);
            if(index !== -1) {
                currentHand.splice(index, 1)
            }
        })
        if(currentHand.length + cards.length === handSize) {
            await handDoc.set({cardIds: currentHand})
            this.logger.info(`Hand ${hand} now has ${currentHand.length} cards, was ${handSize}`)
            return true
        } else {
            this.logger.error(`Hand ${hand} don\'t have required cards`)
            return false
        }
    }

    async discardCards(hand: any, cards: any[]) {
        this.logger.info(`Discarding ${cards.length} cards from ${hand}`)
        const result = await this.discardFromHand(hand, cards)
        if(result) {
            // await this.addToHand(CONST.HANDS.DISCARD)
        }
    }

    async drawCard(athlete: string) {
        const athleteHand = this.handCollection.doc(athlete);
        const currentHand = (await athleteHand.get()).data()?.cardIds || []
        this.logger.info(`Athlete ${athlete} has ${currentHand.length} cards, tries to draw a card`)
        if(currentHand.length < RULES.HAND_SIZE) {
            return await this.dealCards([athlete], 1)
        } else {
            this.logger.info(`Athlete ${athlete} hand is full (${currentHand})`)
            return 'Hand is full'
        }
    }

    async submitActivity(activityId: string, cardIds: string[], imageIds: string[], comments: string) {
        const activityDoc = this.detailedActivityCollection.doc(activityId.toString())
        const activity = (await activityDoc.get()).data() || {}
        const athleteDoc = this.athleteCollection.doc(activity.athlete.id.toString())
        const athlete = (await athleteDoc.get()).data() || {}

        if(activity.gameData.status !== CONST.ACTIVITY_STATUSES.NEW
            && activity.gameData.status !== CONST.ACTIVITY_STATUSES.REJECTED) {
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} submitted activity ${activityId} with invalid status ${activity.gameData.status}`)
            return RESPONSES.ERROR.WRONG_ACTIVITY_STATUS
        }

        if(cardIds.length > RULES.MAX_CARDS_SUBMIT) {
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} submitted activity with too many cards ${cardIds}`)
            return RESPONSES.ERROR.MAX_CARDS_SUBMIT
        }

        const cardQuery = this.cardCollection.where('id', 'in', cardIds)
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
            const itemQuery = this.cardCollection.where('id', 'in', cardIds)
            const itemDocs = await itemQuery.get()
            itemDocs.forEach(item => {
                energySpent = energySpent + getTier(item.data().value);
            })
        }

        const athleteDoc = this.athleteCollection.doc(athleteId.toString())
        const athleteExists = (await athleteDoc.get()).exists
        if(athleteExists) {
            const athlete = (await athleteDoc.get()).data() || {}
            const newVal = Math.max((athlete.energy || 0) - energySpent, 0);
            await athleteDoc.update(
                {
                    energy: newVal
                })
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} spent ${energySpent} energy, now ${newVal}`)
            return true;
        } else {
            this.logger.info(`Athlete ${athleteId} doesn't exist`)
            return false;
        }
    }


    async updateQueueUses(amount: number) {
        const queueDoc = await this.handCollection.doc(CONST.HANDS.QUEUE)
        const queue = (await queueDoc.get()).data() || {}
        const gameDoc = this.gameCollection.doc(CONST.GAME_ID)
        const game = (await gameDoc.get()).data() || {}
        let newCardUses = game.cardUses + amount;
        let newShifts = game.shifts;
        // Queue behavior is disabled
        // Use RULES.QUEUE.CARDS_TO_SHIFT for fixed queue length
        if(newCardUses >= queue.cardIds.length) {
            newCardUses = newCardUses - queue.cardIds.length;
            newShifts++;
            // const lastQueueCardId = queue.cardIds[queue.cardIds.length - 1];
            // await this.discardFromHand(CONST.HANDS.QUEUE, [lastQueueCardId])
            // await this.addToHand(CONST.HANDS.DISCARD, [lastQueueCardId])
            await this.updateCardValues(queue.cardIds)

            // const response = await this.dealQueue()
            // switch (response) {
            //     case RESPONSES.ERROR.NOT_ENOUGH_CARDS:
            //         await this.resetDiscardPile()
            //         await this.dealQueue()
            // }
        }
        await gameDoc.update({
            cardUses: newCardUses,
            shifts: newShifts
        })
        this.logger.info(`Card uses updated to ${newCardUses}, total shifts (recalculations) now ${newShifts}`)
    }

    async resetDiscardPile() {
        const discardDoc = this.handCollection.doc(CONST.HANDS.DISCARD)
        const discard = (await discardDoc.get()).data() || {}
        await this.addToHand(CONST.HANDS.DECK, discard.cardIds)
        await this.shuffleDeck()
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

        const cardTotals = calculateTotals(cardIds, this.cardCollection);
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
            const cardDoc = await this.cardCollection.doc(cardIds[i].toString())
            const card = (await cardDoc.get()).data() || {}

            let cardUses = card.cardUses.queue;
            if(parseInt(card.value) >= 7 && cardUses > 0) { // Additional point dump
                cardUses = cardUses + 1;
            }
            const valueDelta = (RULES.CARD_VALUE_STEP * (1 - cardUses));
            const newValue = parseInt(card.value) + valueDelta
            cardDoc.update({
                value: newValue < RULES.CARD_VALUE_MIN ? RULES.CARD_VALUE_MIN : newValue > RULES.CARD_VALUE_MAX ? RULES.CARD_VALUE_MAX : newValue,
                cardUses: {
                    ...card.cardUses,
                    queue: 0
                }
            })
            this.logger.info(`Card ${card.id} (${card.title}) value changed by ${valueDelta}, now ${newValue}`)
        }
    }

    async restoreAthletesEnergy(value: number) {
        const athleteQuery = await this.athleteCollection.get()
        athleteQuery.docs.forEach((athlete) => {
            const excessEnergy = ((athlete.data().energy || 0) + value) - RULES.ENERGY.MAX;
            const newVal = Math.min((athlete.data().energy || 0) + value, RULES.ENERGY.MAX)
            this.athleteCollection.doc(athlete.data().id.toString()).update({
                energy: newVal,
                coins: (athlete.data().coins || 0) + (excessEnergy > 0 ? excessEnergy * RULES.COINS.PER_ENERGY_CONVERSION : 0)
            })
            this.logger.info(`Athlete ${athlete.data().firstname} ${athlete.data().lastname} ${athlete.data().id} restored ${value} energy, now ${newVal}, and ${(excessEnergy > 0 ? excessEnergy * RULES.COINS.PER_ENERGY_CONVERSION : 0)} coins`)
        })
    }

    async updateBaseWorkout(athleteIds: any[], baseWorkoutPatch: any) {
        athleteIds = athleteIds.map(id => parseInt(id, 10))
        const athleteQuery = this.athleteCollection.where('id', 'in', athleteIds)
        const athleteDocs = await athleteQuery.get()
        athleteDocs.forEach((athlete) => {
            const athleteDoc = this.athleteCollection.doc(athlete.id.toString())
            const currentBaseWorkout = athlete.data().baseWorkout;
            athleteDoc.update({
                baseWorkout: {
                    ...currentBaseWorkout,
                    ...Object.keys(baseWorkoutPatch).reduce((acc: any, type) => {
                        acc[type] = {...currentBaseWorkout[type], ...baseWorkoutPatch[type]}
                        return acc;
                    }, {})
                }
            })
            this.logger.info(`Base workout updated for ${athlete.data().firstname} ${athlete.data().lastname} ${athlete.id} with ${JSON.stringify(baseWorkoutPatch)}`)
        })
    }

    async setPermissions(athleteIds: string[], permissions: string[]) {
        for(let id of athleteIds) {
            await this.athleteCollection.doc(id.toString()).update({
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
        return await this.dealQueue()
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
        const athleteDoc = this.athleteCollection.doc(athleteId.toString())
        const athleteExists = (await athleteDoc.get()).exists
        if(athleteExists) {
            const athlete = (await athleteDoc.get()).data() || {}
            await athleteDoc.update(
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
