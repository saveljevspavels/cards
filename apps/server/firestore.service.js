import firebase from "firebase";
import {
    generateId,
    getEnergyAdjustedValue,
    getRandomInt,
    getTier,
    normalizeActivityType,
    tierToRoman,
    updateScoreValues
} from "./util.js";
import CONST from "../../definitions/constants.json";
import RULES from "../../definitions/rules.json";
import {RESPONSES} from "./response-codes.js";
import {ValidationService} from "./shared/validation.service.js";
import fs from "fs";
import schedule from "node-schedule";

export class FirestoreService {
    logger;

    db = firebase.initializeApp(
        JSON.parse(fs.readFileSync(
            `definitions/firebaseConfig${process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''}.json`,
            'utf8'))
    ).firestore();
    athleteCollection = this.db.collection(CONST.COLLECTIONS.ATHLETES)
    pendingActivityCollection = this.db.collection(CONST.COLLECTIONS.PENDING_ACTIVITIES)
    detailedActivityCollection = this.db.collection(CONST.COLLECTIONS.DETAILED_ACTIVITIES)
    commandCollection = this.db.collection(CONST.COLLECTIONS.COMMANDS)
    handCollection = this.db.collection(CONST.COLLECTIONS.HANDS)
    cardCollection = this.db.collection(CONST.COLLECTIONS.CARDS)
    cardFactoryCollection = this.db.collection(CONST.COLLECTIONS.CARD_FACTORIES)
    achievementCollection = this.db.collection(CONST.COLLECTIONS.ACHIEVEMENTS)
    scoreCollection = this.db.collection(CONST.COLLECTIONS.SCORES)
    gameCollection = this.db.collection(CONST.COLLECTIONS.GAME)

    constructor(logger) {
        this.logger = logger;
        Object.getOwnPropertyNames(FirestoreService.prototype).forEach(method => {
            if(['constructor', 'errorHandlerWrap'].indexOf(method) === -1) {
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

    errorHandlerWrap(methodName, method) {
        return async (...args) => {
            try {
                return await method.bind(this).call(this, ...args)
            } catch (err) {
                this.logger.error(methodName, err)
            }

        }
    }

    async saveAthlete(athlete) {
        const athleteDoc = this.athleteCollection.doc(athlete.id.toString())
        const athleteExists = (await athleteDoc.get()).exists
        if(!athleteExists) {
            await athleteDoc.set(
                {
                    ...athlete,
                    baseWorkout: RULES.DEFAULT_BASE_WORKOUT,
                    permissions: ['default'],
                    achievements: [],
                    energy: RULES.ENERGY.BASE
                })
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} saved`)
            return true;
        } else {
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} logged in`)
            return false;
        }
    }

    addPendingActivity(activity){
        return this.pendingActivityCollection.doc(activity.object_id.toString()).set(activity)
            .then(() => {
                this.logger.info(`Pending activity ${activity.object_id.toString()} added!`);
            })
            .catch((error) => {
                this.logger.error(`Error writing document: ${error}`);
            });
    }

    deletePendingActivity(activityId) {
        return this.pendingActivityCollection.doc(activityId.toString()).delete()
            .then(() => {
                // this.logger.info(`Pending activity ${activityId.toString()} deleted!`); // Too much spam
            })
            .catch((error) => {
                this.logger.error(`Error deleting document: ${error}`);
            });
    }

    async addDetailedActivity(activity) {
        const activityDoc = this.detailedActivityCollection.doc(activity.id.toString())
        const activityExists = (await activityDoc.get()).exists
        if(activityExists) {
            // this.logger.error(`Activity ${activity.id} already exists`); Too much spam
        } else {
            this.logger.info(`Activity ${activity.id} added for athlete ${activity.athlete.id}`);
            return this.detailedActivityCollection.doc(activity.id.toString()).set(activity)
        }
    }

    async addCommand(athleteId, command) {
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

    async deleteCommand(commandId) {
        return this.commandCollection.doc(commandId).delete()
            .then(() => {
                this.logger.info(`Command ${commandId} deleted!`);
            })
            .catch((error) => {
                this.logger.error(`Error writing document: ${error}`);
            });
    }

    async setDeck(cards) {
        const deck = this.handCollection.doc(CONST.HANDS.DECK);
        await deck.set({cardIds: cards})
    }

    async addToHand(hand, cards) {
        const handDoc = this.handCollection.doc(hand);
        const currentDeck = (await handDoc.get()).data()?.cardIds || []
        await handDoc.set({cardIds: [...cards, ...currentDeck || []]})
        this.logger.info(`Adding ${cards.length} cards to hand ${hand} (now ${currentDeck.length + cards.length})`)
    }

    async deleteCards(cards) {
        const handsToCheck = ['deck', 'discard', 'queue']
        for(let i = 0; i < handsToCheck.length; i++) {
            const handDocument = this.handCollection.doc(CONST.HANDS[handsToCheck[i].toUpperCase()]);
            const currentHand = (await handDocument.get()).data()?.cardIds || []
            cards.forEach(card => {
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

    async dealCards(athletes, amount) {
        const deck = this.handCollection.doc(CONST.HANDS.DECK);
        const currentDeck = (await deck.get()).data()?.cardIds || []
        if(!amount) {
            amount = currentDeck.length;
        }
        this.logger.info(`Cards in deck: ${currentDeck.length} dealing ${amount * athletes.length} cards`)
        if(currentDeck.length >= amount * athletes.length) {
            const athleteCards = {}
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

    async discardFromHand(hand, cards) {
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

    async discardCards(hand, cards) {
        this.logger.info(`Discarding ${cards.length} cards from ${hand}`)
        const result = await this.discardFromHand(hand, cards)
        if(result) {
            await this.addToHand(CONST.HANDS.DISCARD)
        }
    }

    async drawCard(athlete) {
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

    async submitActivity(activityId, cardIds, imageIds, comments) {
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
        const cardSnapshots = [];
        cardDocs.forEach((card) => {
            const cardSnapshot = card.data();
            cardSnapshot.earnedValue = getEnergyAdjustedValue(cardSnapshot.value, athlete.energy)
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

    async rejectActivity(activityId, comments) {
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

    async deleteActivity(activityId) {
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

    async tryAutoApprove(activityId) {
        this.logger.info(`Attempting auto approve for activity ${activityId}`)
        const activityDoc = this.detailedActivityCollection.doc(activityId.toString())
        const activity = (await activityDoc.get()).data() || {}
        if(!activity.gameData.cardSnapshots[0]) {
            this.logger.info(`No cards provided on activity ${activityId}, switching to manual validation`)
        } else {
            const card = activity.gameData.cardSnapshots[0]

            if(activity.gameData.cardSnapshots.find(card => card.manualValidation)) {
                this.logger.info(`Manual validation required for card ${card.id}`)
                return RESPONSES.SUCCESS;
            }

            const athleteDoc = this.athleteCollection.doc(activity.athlete.id.toString())
            const athlete = (await athleteDoc.get()).data() || {}

            if(activity.gameData.cardSnapshots
                .reduce((acc, card) => [...acc, ...card.validators], [])
                .reduce((acc, validator) => acc && ValidationService.validateRule(activity, validator, athlete.baseWorkout), true)
            ) { // Checks all validators
                this.logger.info(`All validators passed for ${activityId}`)
                await this.approveActivity(activityId, [card.id])
            } else {
                this.logger.info(`Validator(s) failed, switching for manual approve ${activityId}`)
            }
        }
        return RESPONSES.SUCCESS;
    }

    async approveActivity(activityId, cardIds = []) {
        const activityDoc = this.detailedActivityCollection.doc(activityId.toString())
        const activity = (await activityDoc.get()).data() || {}
        if(activity.gameData.status === CONST.ACTIVITY_STATUSES.APPROVED) {
            this.logger.error(`Activity ${activityId} was already approved for athlete ${activity.athlete.id.toString()}`)
            return;
        }

        await activityDoc.set({
            ...activity,
            gameData: {
              ...activity.gameData,
              status: CONST.ACTIVITY_STATUSES.APPROVED,
              cardIds,
              cardSnapshots: activity.gameData.cardSnapshots.filter(snapshot => cardIds.indexOf(snapshot.id) !== -1)
            }
        })

        const athleteDoc = this.athleteCollection.doc(activity.athlete.id.toString())
        const athlete = (await athleteDoc.get()).data() || {}

        this.logger.info(`Activity ${activityId} was approved for athlete ${athlete.firstname} ${athlete.lastname} with cards ${cardIds}`)

        await this.updateScore(activity.athlete.id.toString(), cardIds, [], athlete.energy);
        await this.spendEnergy(activity.athlete.id.toString(), cardIds);
        await this.updateCardUses(cardIds);
        await Promise.all([
            this.updatePersonalBests(activity, cardIds),
            this.updateQueueUses(cardIds.length)
        ])
    }

    async updatePersonalBests(activity, cardIds) {
        if(cardIds.length) {
            const cardQuery = this.cardCollection.where('id', 'in', cardIds)
            const cardDocs = await cardQuery.get()
            const baseWorkoutPatch = {};
            const normalizedType = normalizeActivityType(activity.type);
            baseWorkoutPatch[normalizedType] = {};
            cardDocs.forEach((card) => {
                card.data().validators.forEach(validator => {
                    RULES.UPDATABLE_PROPERTIES.forEach(property => {
                        if(validator.formula.indexOf(property) !== -1) {
                            baseWorkoutPatch[normalizedType][property] = (activity[validator.property] - RULES.UPDATABLE_PROPERTIES_DELTA[property])
                        }
                    })
                })
            })
            if(Object.keys(baseWorkoutPatch[normalizedType]).length) {
                await this.updateBaseWorkout([activity.athlete.id.toString()], baseWorkoutPatch)
            }
        }
    }

    async spendEnergy(athleteId, cardIds) {
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

    async updateCardUses(cardIds) {
        if(cardIds.length) {
            const cardQuery = this.cardCollection.where('id', 'in', cardIds)
            const cardDocs = await cardQuery.get()
            cardDocs.forEach((card) => {
                const newProgression = card.data().cardUses.progression + 1;
                card.ref.update({
                    cardUses: {
                        ...card.data().cardUses,
                        progression: newProgression,
                        queue: card.data().cardUses.queue + 1,
                    }
                })
                if(card.data().progression !== CONST.PROGRESSION.NONE && newProgression >= card.data().cardUses.usesToProgress) {
                    this.progressCard(card.data().id)
                    this.restoreAthletesEnergy(RULES.ENERGY.NEW_CARD_RESTORE);
                }
            })
        }
    }

    async progressCard(cardId) {
        const cardDoc = this.cardCollection.doc(cardId)
        const card = (await cardDoc.get()).data() || {}
        let nextTier = card.tier;
        switch (card.progression) {
            case CONST.PROGRESSION.TIERS:
            case CONST.PROGRESSION.CHAIN:
                nextTier = parseInt(nextTier) + 1;
                break;
        }
        this.logger.info(`Progressing card ${cardId} to ${card.progression} ${nextTier}`)
        const factory = (await this.cardFactoryCollection.doc(card.factoryId).get()).data() || {}

        switch (card.progression) {
            case CONST.PROGRESSION.CHAIN:
                const newCardId = generateId();
                await cardDoc.update({
                    progression: CONST.PROGRESSION.NONE
                })
                await this.createCardFromFactory(factory, nextTier, newCardId);
                await this.addToHand(CONST.HANDS.QUEUE, [newCardId]);
                break;
            default:
                await this.createCardFromFactory(factory, nextTier, card.id);
        }
    }

    async updateQueueUses(amount) {
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
            await this.restoreAthletesEnergy(RULES.ENERGY.SHUFFLE_RESTORE);

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

    async updateScore(athleteId, cardIds, achievementIds, energy) {
        const scoreDoc = this.scoreCollection.doc(athleteId.toString())
        const score = (await scoreDoc.get()).data() || {}
        const calculateTotals = async (ids, collection, energy) => {
            const items = [];
            const values = {
                earned: 0,
                reduced: 0
            }
            if(ids?.length) {
                const itemQuery = collection.where('id', 'in', ids)
                const itemDocs = await itemQuery.get()
                itemDocs.forEach(item => {
                    items.push(item.data())
                })
                items.reduce((acc, item) => {
                    acc.earned = acc.earned + getEnergyAdjustedValue(item.value, energy)
                    acc.reduced = acc.reduced + (parseInt(item.value) - acc.earned);
                    return acc;
                }, values);
            }
            return {
                amount: items.length || 0,
                totalEarned: values.earned,
                totalReduced: values.reduced,
            }
        }

        const cardTotals = calculateTotals(cardIds, this.cardCollection, energy);
        const achievementTotals = calculateTotals(achievementIds, this.achievementCollection, RULES.ENERGY.MAX);
        const newScore = updateScoreValues(
            score,
            (await cardTotals).totalEarned + (await achievementTotals).totalEarned,
            (await cardTotals).totalReduced + (await achievementTotals).totalReduced,
            (await cardTotals).amount,
            (await achievementTotals).amount
        )
        await scoreDoc.set({
            ...newScore,
            athleteId: athleteId
        });

        this.logger.info(`Athlete ${athleteId} new score: ${JSON.stringify(newScore)}, was ${JSON.stringify(score)}`)
    }

    async updateCardValues(cardIds) {
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

    async restoreAthletesEnergy(value) {
        const athleteQuery = await this.athleteCollection.get()
        athleteQuery.docs.forEach((athlete) => {
            const newVal = Math.min((athlete.data().energy || 0) + value, RULES.ENERGY.MAX)
            this.athleteCollection.doc(athlete.data().id.toString()).update({
                energy: newVal
            })
            this.logger.info(`Athlete ${athlete.data().firstname} ${athlete.data().lastname} ${athlete.data().id} restored ${value} energy, now ${newVal}`)
        })
    }

    async createCardFactory(card) {
        const id = card.id || generateId()
        return this.cardFactoryCollection.doc(id).set({
            ...card,
            id
        })
            .then(() => {
                this.logger.info(`New card ${card.title} ${card.id} factory created!`);
            })
            .catch((error) => {
                this.logger.error(`Error writing document: ${error}`);
            });
    }

    async createCardInstances(tier, amount, cardFactoryIds) {
        const cardFactories = [];
        if(cardFactoryIds.length) {
            const factoryQuery = this.cardFactoryCollection.where('id', 'in', cardFactoryIds)
            const factoryDocs = await factoryQuery.get()
            factoryDocs.forEach(factory => {
                cardFactories.push(factory.data())
            })
        }
        cardFactories.forEach((factory => {
            for(let i = 0; i < amount; i++) {
                this.createCardFromFactory(factory, tier)
            }
        }))
    }

    async createCardFromFactory(factory, tier, id = generateId()) {
        let card = factory.progression === CONST.PROGRESSION.FLAT
            ? factory.cards[getRandomInt(Object.keys(factory.cards).length)] // Random card for flat progression
            : factory.cards[tier]
        if(!card) {
            this.logger.error(`Card ${factory.title} tier ${tier} not defined`)
            return;
        }
        let newProgression = factory.progression;
        if ((factory.progression === CONST.PROGRESSION.CHAIN || factory.progression === CONST.PROGRESSION.TIERS) && Object.keys(factory.cards).length === parseInt(tier) + 1) {
            this.logger.info(`Card ${factory.title} tier ${tier} is final, switching progression to ${CONST.PROGRESSION.NONE}`)
            newProgression = CONST.PROGRESSION.NONE;
        }
        card = {
            id,
            title: factory.title + ((factory.progression === CONST.PROGRESSION.CHAIN || factory.progression === CONST.PROGRESSION.TIERS) ? ' ' + tierToRoman(tier) : ''),
            image: factory.image || '',
            factoryId: factory.id,
            progression: newProgression,
            manualValidation: factory.manualValidation,
            tier,
            ...card,
            validators: Object.values(card.validators)
        }
        card.cardUses = {
            usesToProgress: parseInt(card.usesToProgress, 10),
            queue: 0,
            progression: 0
        }
        delete card.usesToProgress;
        await this.cardCollection.doc(id).set(card)

        this.logger.info(`Created ${factory.title} card ${id}, ${tier} tier`)
    }

    async combineCards(athleteId, cardIds) {
        const cards = [];
        if(cardIds.length) {
            const cardQuery = this.cardCollection.where('id', 'in', cardIds)
            const cardDocs = await cardQuery.get()
            cardDocs.forEach(card => {
                cards.push(card.data())
            })
        }
        if(cards.length !== 2) {
            return 'Invalid card ids'
        } else if (cards[0].tier !== cards[1].tier){
            return 'Cards are different tiers'
        } else if (cards[0].factoryId !== cards[1].factoryId) {
            return 'Cards are different type'
        } else {
            await this.discardFromHand(athleteId, [cards[1].id])
            return await this.setCardTier(cards[0], ++cards[0].tier)
        }
    }

    async setCardTier(card, tier) {
        const factoryDoc = this.cardFactoryCollection.doc(card.factoryId.toString())
        const factory = (await factoryDoc.get()).data() || {}

        if(factory) {
            await this.cardCollection.doc(card.id).set({
                ...card,
                tier,
                ...factory.tiers[tier]
            })
            return RESPONSES.SUCCESS
        } else {
            return 'Invalid factory'
        }
    }

    async updateBaseWorkout(athleteIds, baseWorkoutPatch) {
        athleteIds = athleteIds.map(id => parseInt(id, 10))
        const athleteQuery = this.athleteCollection.where('id', 'in', athleteIds)
        const athleteDocs = await athleteQuery.get()
        athleteDocs.forEach((athlete) => {
            const athleteDoc = this.athleteCollection.doc(athlete.id.toString())
            const currentBaseWorkout = athlete.data().baseWorkout;
            athleteDoc.update({
                baseWorkout: {
                    ...currentBaseWorkout,
                    ...Object.keys(baseWorkoutPatch).reduce((acc, type) => {
                        acc[type] = {...currentBaseWorkout[type], ...baseWorkoutPatch[type]}
                        return acc;
                    }, {})
                }
            })
            this.logger.info(`Base workout updated for ${athlete.data().firstname} ${athlete.data().lastname} ${athlete.id} with ${JSON.stringify(baseWorkoutPatch)}`)
        })
    }

    async setPermissions(athleteIds, permissions) {
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


    async createAchievement(achievement) {
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

    deleteAchievement(achievementId) {
        return this.achievementCollection.doc(achievementId.toString()).delete()
            .then(() => {
                this.logger.info(`Achievement ${achievementId.toString()} deleted!`); // Too much spam
            })
            .catch((error) => {
                this.logger.error(`Error deleting document: ${error}`);
            });
    }

    async assignAchievement(athleteId, achievementId) {
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
