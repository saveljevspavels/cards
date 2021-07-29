import firebase from "firebase";
// @ts-ignore
import * as FIREBASE_CONFIG from "../../definitions/firebaseConfig.json";
import {generateId, getRandomInt, updateScore} from "./util.js";
import CONST from "../../definitions/constants.json";
import RULES from "../../definitions/rules.json";

export class FirestoreService {
    db = firebase.initializeApp(FIREBASE_CONFIG.default).firestore();
    athleteCollection = this.db.collection(CONST.COLLECTIONS.ATHLETES)
    pendingActivityCollection = this.db.collection(CONST.COLLECTIONS.PENDING_ACTIVITIES)
    detailedActivityCollection = this.db.collection(CONST.COLLECTIONS.DETAILED_ACTIVITIES)
    commandCollection = this.db.collection(CONST.COLLECTIONS.COMMANDS)
    handCollection = this.db.collection(CONST.COLLECTIONS.HANDS)
    cardCollection = this.db.collection(CONST.COLLECTIONS.CARDS)
    cardFactoryCollection = this.db.collection(CONST.COLLECTIONS.CARD_FACTORIES)
    scoreCollection = this.db.collection(CONST.COLLECTIONS.SCORES)

    constructor() {
    }

    async saveAthlete(athlete) {
        const athleteDoc = this.athleteCollection.doc(athlete.id.toString())
        const athleteExists = (await athleteDoc.get()).exists
        if(!athleteExists) {
            await athleteDoc.set(
                {
                    ...athlete,
                    division: {
                        RUN: 1,
                        BIKE: 1
                    },
                    permissions: ['default']
                })
            console.log('Athlete', athlete.id, 'saved')
        } else {
            console.log('Athlete', athlete.id, 'logged in')
        }
    }

    addPendingActivity(activity){
        return this.pendingActivityCollection.doc(activity.object_id.toString()).set(activity)
            .then(() => {
                console.log("Pending activity added!");
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    }

    deletePendingActivity(activityId) {
        return this.pendingActivityCollection.doc(activityId.toString()).delete()
            .then(() => {
                console.log("Pending activity deleted!");
            })
            .catch((error) => {
                console.error("Error deleting document: ", error);
            });
    }

    async addDetailedActivity(activity) {
        const activityDoc = this.detailedActivityCollection.doc(activity.id.toString())
        const activityExists = (await activityDoc.get()).exists
        if(activityExists) {
            console.error("Activity", activity.id, 'already exists');
        } else {
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
            console.log("Command added!");
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
    }

    async deleteCommand(commandId) {
        return this.commandCollection.doc(commandId).delete()
            .then(() => {
                console.log("Command deleted!");
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    }

    async setDeck(cards) {
        const deck = this.handCollection.doc(CONST.HANDS.DECK);
        await deck.set({cardIds: cards})
    }

    async addToDeck(cards) {
        const deck = this.handCollection.doc(CONST.HANDS.DECK);
        const currentDeck = (await deck.get()).data()?.cardIds || []
        await deck.set({cardIds: [...currentDeck, ...cards]})
        console.log('Adding', cards.length, 'cards to deck (now', currentDeck.length + cards.length, ')')
    }

    async shuffleDeck() {
        const deck = this.handCollection.doc(CONST.HANDS.DECK);
        const currentDeck = (await deck.get()).data()?.cardIds

        const shuffledDeck = []
        while(currentDeck.length) {
            const i = getRandomInt(currentDeck.length)
            shuffledDeck.push(...currentDeck.splice(i, 1))
        }

        await this.setDeck({cardIds: shuffledDeck})
        console.log('Decs is shuffled, contains', shuffledDeck, 'cards')
    }

    async dealCards(athletes, amount) {
        const deck = this.handCollection.doc(CONST.HANDS.DECK);
        const currentDeck = (await deck.get()).data()?.cardIds || []
        console.log('Cards in deck:', currentDeck.length, 'dealing', amount * athletes.length, 'cards')
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
                this.dealToAthlete(key, athleteCards[key])
            })
            await deck.set({cardIds: currentDeck})
            return CONST.DEFAULT_RESPONSE;
        } else {
            console.log('Not enough cards in deck')
            return 'Not enough cards in deck';
        }
    }

    async dealToAthlete(athlete, cards) {
        const athleteHand = this.handCollection.doc(athlete);
        const currentHand = (await athleteHand.get()).data()?.cardIds
        const newHand = [...currentHand || [], ...cards]
        await athleteHand.set({cardIds: newHand})
    }

    async discardFromAthlete(athlete, cards) {
        const athleteHand = this.handCollection.doc(athlete);
        const currentHand = (await athleteHand.get()).data()?.cardIds || []
        const handSize = currentHand.length;
        cards.forEach(card => {
            const index = currentHand.indexOf(card);
            if(index !== -1) {
                currentHand.splice(index, 1)
            }
        })
        if(currentHand.length + cards.length === handSize) {
            await athleteHand.set({cardIds: currentHand})
            console.log('Athlete', athlete, 'now has', currentHand.length, 'cards, was', handSize)
            return true
        } else {
            console.error('Athlete', athlete, 'don\'t have required cards')
            return false
        }
    }

    async discardCards(athlete, cards) {
        console.log('Discarding', cards.length, 'cards from', athlete)
        const result = await this.discardFromAthlete(athlete, cards)
        if(result) {
            await this.addToDeck(cards)
        }
    }

    async drawCard(athlete) {
        const athleteHand = this.handCollection.doc(athlete);
        const currentHand = (await athleteHand.get()).data()?.cardIds || []
        console.log('Athlete', athlete, 'has', currentHand.length, 'cards, tries to draw a card')
        if(currentHand.length < RULES.HAND_SIZE) {
            return await this.dealCards([athlete], 1)
        } else {
            console.log('Athlete', athlete, 'hand is full (', currentHand, ')')
            return 'Hand is full'
        }
    }

    async submitActivity(activityId, cardIds, imageIds, comments) {
        const activityDoc = this.detailedActivityCollection.doc(activityId.toString())
        const activity = (await activityDoc.get()).data() || {}
        const athleteId = activity.athlete.id.toString();
        await activityDoc.set({
            ...activity,
            gameData: {
                status: CONST.ACTIVITY_STATUSES.SUBMITTED,
                cards: cardIds,
                images: imageIds,
                comments
            }
        })
        await this.discardCards(athleteId, cardIds)
        console.log('Athlete', athleteId, 'submitted activity with', cardIds)
    }

    async rejectActivity(activityId) {
        const activityDoc = this.detailedActivityCollection.doc(activityId.toString())
        const activity = (await activityDoc.get()).data() || {}
        await activityDoc.set({
            ...activity,
            gameData: {
                ...activity.gameData,
                status: CONST.ACTIVITY_STATUSES.REJECTED,
            }
        })
        console.log('Activity', activityId, 'was rejected for athlete', activity.athlete.id.toString())
    }

    async approveActivity(activityId, cardIds = []) {
      const activityDoc = this.detailedActivityCollection.doc(activityId.toString())
      const activity = (await activityDoc.get()).data() || {}
      await activityDoc.set({
        ...activity,
        gameData: {
          ...activity.gameData,
          status: CONST.ACTIVITY_STATUSES.APPROVED,
          cards: cardIds
        }
      })
      const scoreDoc = this.scoreCollection.doc(activity.athlete.id.toString())
      const score = (await scoreDoc.get()).data() || {}

      const playedCards = [];
      if(cardIds.length) {
        const cardQuery = this.cardCollection.where('id', 'in', cardIds)
        const cardDocs = await cardQuery.get()
        cardDocs.forEach(card => {
          playedCards.push(card.data())
        })
      }

      const newScore = updateScore(
        score,
        cardIds.length ? playedCards.reduce((acc, card) => acc + parseInt(card.value), 0) : 0,
        cardIds.length ? playedCards.reduce((acc, card) => acc + parseInt(card.modifier), 0) :  0,
        cardIds.length ? playedCards.length : 0
      )
      await scoreDoc.set({
        ...newScore,
        athleteId: activity.athlete.id.toString()
      });

      console.log('Activity', activityId, 'was approved for athlete', activity.athlete.id.toString(), 'with cards', cardIds)
    }

    async createCardFactory(card) {
        const id = card.id || generateId()
        return this.cardFactoryCollection.doc(id).set({
            ...card,
            id
        })
            .then(() => {
                console.log("New card created!");
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
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

        console.log('Created', cardFactories.length * amount, 'cards, tier', tier)
    }

    async createCardFromFactory(factory, tier) {
        const id = generateId();
        await this.cardCollection.doc(id).set({
            id,
            title: factory.title,
            image: factory.image,
            factoryId: factory.id,
            tier,
            ...factory.tiers[tier]
        })
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
            await this.discardFromAthlete(athleteId, [cards[1].id])
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
            return CONST.DEFAULT_RESPONSE
        } else {
            return 'Invalid factory'
        }
    }

    async setDivisions(athleteIds, division) {
        for(let id of athleteIds) {
            const athleteDoc = this.athleteCollection.doc(id.toString())
            const athlete = (await athleteDoc.get()).data() || {}

            await athleteDoc.set({
                ...athlete,
                division
            })
        }
    }

    async setPermissions(athleteIds, permissions) {
        for(let id of athleteIds) {
            const athleteDoc = this.athleteCollection.doc(id.toString())
            const athlete = (await athleteDoc.get()).data() || {}

            await athleteDoc.set({
                ...athlete,
                permissions
            })
        }
    }
}
