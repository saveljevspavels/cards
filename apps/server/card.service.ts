import {RESPONSES} from "./response-codes";
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import {generateId, getRandomInt, tierToRoman} from "./helpers/util";
import {Logger} from "winston";
import CardFactory, {CardPrototype, Progression} from "../shared/interfaces/card-factory";
import Card from "../shared/interfaces/card";

export default class CardService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger
    ) {

        app.post(`${CONST.API_PREFIX}create-card-factory`, async(req, res) => {
            await this.createCardFactory(req.body)
            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}create-card-instances`,async (req, res) => {
            await this.createCardInstances(req.body.tier, req.body.amount, req.body.cardFactoryIds)
            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}combine-cards`, async (req, res) => {
            const response = await this.combineCards(req.body.athleteId, req.body.cardIds)
            res.status(response === RESPONSES.SUCCESS ? 200 : 400).send({response});
        });
    }

    async createCardFactory(cardFactory: CardFactory) {
        const id = cardFactory.id || generateId()
        return this.fireStoreService.cardFactoryCollection.doc(id).set({
            ...cardFactory,
            id
        })
            .then(() => {
                this.logger.info(`New card ${cardFactory.title} ${cardFactory.id} factory created!`);
            })
            .catch((error) => {
                this.logger.error(`Error writing document: ${error}`);
            });
    }

    async createCardInstances(tier: number, amount: number, cardFactoryIds: string[]) {
        const cardFactories: any[] = [];
        if(cardFactoryIds.length) {
            const factoryQuery = this.fireStoreService.cardFactoryCollection.where('id', 'in', cardFactoryIds)
            const factoryDocs = await factoryQuery.get()
            factoryDocs.forEach(factory => {
                cardFactories.push(factory.data())
            })
        }
        cardFactories.forEach(((factory: CardFactory) => {
            for(let i = 0; i < amount; i++) {
                this.createCardFromFactory(factory, tier)
            }
        }))
    }

    async createCardFromFactory(factory: CardFactory, tier: number, id = generateId()) {
        let cardPrototype: CardPrototype = factory.progression === Progression.FLAT
            ? factory.cards[getRandomInt(Object.keys(factory.cards).length)] // Random card for flat progression
            : factory.cards[tier]
        if(!cardPrototype) {
            this.logger.error(`Card ${factory.title} tier ${tier} not defined`)
            return;
        }
        let newProgression = factory.progression;
        if ((factory.progression === Progression.CHAIN || factory.progression === Progression.TIERS) && Object.keys(factory.cards).length === tier + 1) {
            this.logger.info(`Card ${factory.title} tier ${tier} is final, switching progression to ${Progression.NONE}`)
            newProgression = Progression.NONE;
        }
        const card: Card = {
            id,
            title: factory.title + ((factory.progression === Progression.CHAIN || factory.progression === Progression.TIERS) ? ' ' + tierToRoman(tier) : ''),
            image: factory.image || '',
            factoryId: factory.id,
            progression: newProgression,
            manualValidation: factory.manualValidation,
            value: cardPrototype.value,
            tier: cardPrototype.tier,
            description: cardPrototype.description,
            energyCost: cardPrototype.energyCost,
            energyReward: cardPrototype.energyReward,
            coinsCost: cardPrototype.coinsCost,
            coinsReward: cardPrototype.coinsReward,
            cardUses: {
                usesToProgress: cardPrototype.usesToProgress,
                queue: 0,
                progression: 0
            },
            validators: cardPrototype.validators
        }
        await this.fireStoreService.cardCollection.doc(id).set(card)

        this.logger.info(`Created ${factory.title} card ${id}, ${tier} tier`)
    }

    async combineCards(athleteId: string, cardIds: string[]) {
        const cards: any[] = [];
        if(cardIds.length) {
            const cardQuery = this.fireStoreService.cardCollection.where('id', 'in', cardIds)
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
            await this.fireStoreService.discardFromHand(athleteId, [cards[1].id])
            return await this.setCardTier(cards[0], ++cards[0].tier)
        }
    }

    async setCardTier(card: any, tier: number) {
        const factoryDoc = this.fireStoreService.cardFactoryCollection.doc(card.factoryId.toString())
        const factory = (await factoryDoc.get()).data() || {}

        if(factory) {
            await this.fireStoreService.cardCollection.doc(card.id).set({
                ...card,
                tier,
                ...factory.tiers[tier]
            })
            return RESPONSES.SUCCESS
        } else {
            return 'Invalid factory'
        }
    }

    async progressCard(cardId: string) {
        const cardDoc = this.fireStoreService.cardCollection.doc(cardId)
        const card = (await cardDoc.get()).data() || {}
        let nextTier = card.tier;
        switch (card.progression) {
            case Progression.TIERS:
            case Progression.CHAIN:
                nextTier = parseInt(nextTier) + 1;
                break;
        }
        this.logger.info(`Progressing card ${cardId} to ${card.progression} ${nextTier}`)
        const factory: CardFactory | null = ((await this.fireStoreService.cardFactoryCollection.doc(card.factoryId).get()).data() as CardFactory) || null
        if(factory === null) {
            return;
        }
        switch (card.progression) {
            case Progression.CHAIN:
                const newCardId = generateId();
                await cardDoc.update({
                    progression: Progression.NONE
                })
                await this.createCardFromFactory(factory, nextTier, newCardId);
                await this.fireStoreService.addToHand(CONST.HANDS.QUEUE, [newCardId]);
                break;
            default:
                await this.createCardFromFactory(factory, nextTier, card.id);
        }
    }

    async updateCardUses(cardIds: string[]) {
        if(cardIds.length) {
            const cardQuery = this.fireStoreService.cardCollection.where('id', 'in', cardIds)
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
                if(card.data().progression !== Progression.NONE && newProgression >= card.data().cardUses.usesToProgress) {
                    this.progressCard(card.data().id)
                }
            })
        }
    }
}
