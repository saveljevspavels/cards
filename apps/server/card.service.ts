import {RESPONSES} from "./response-codes";
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import {generateId, getRandomInt, tierToRoman} from "./helpers/util";
import {Logger} from "winston";
import CardFactory, {CardPrototype, Progression} from "../shared/interfaces/card-factory.interface";
import Card from "../shared/interfaces/card.interface";
import {ActiveCard} from "../shared/interfaces/active-card";

export default class CardService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger
    ) {

        app.post(`${CONST.API_PREFIX}/create-card-factory`, async(req, res) => {
            await this.createCardFactory(req.body)
            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}/create-card-instances`,async (req, res) => {
            await this.createCardInstances(req.body.tier, req.body.amount, req.body.cardFactoryIds)
            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}/cards/activate-card`,async (req, res) => {
            const cardId = req.body?.cardId;
            const athleteId = res.get('athleteId');
            if(!cardId || !athleteId) {
                res.status(400).send('Card Id or Athlete Id missing');
            } else {
                const card = await this.getCard(cardId);
                if(!card) {
                    res.status(400).send('Card does not exist');
                } else {
                    const athlete = await this.fireStoreService.athleteCollection.get(athleteId)
                    if(athlete) {
                        await this.fireStoreService.athleteCollection.update(athleteId, {
                            activeCards: [...athlete?.activeCards, this.getActiveCard(card)]
                        })
                        res.status(200).send();
                    } else {
                        res.status(400).send('Athlete does not exist');
                    }
                }
            }
        });
    }

    getActiveCard(card: Card): ActiveCard {
        return {
            id: card.id,
            progress: 0,
            firstUse: true
        }
    }

    async getCard(cardId: string): Promise<Card | null> {
        return await this.fireStoreService.cardCollection.get(cardId);
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
        await this.fireStoreService.cardCollection.set(id, card)

        this.logger.info(`Created ${factory.title} card ${id}, ${tier} tier`)
    }

    async combineCards(athleteId: string, cardIds: string[]) {
        const cards: Card[] = await this.fireStoreService.cardCollection.where('id', 'in', cardIds);
        if(cards.length !== 2) {
            return 'Invalid card ids'
        } else if (cards[0].tier !== cards[1].tier){
            return 'Cards are different tiers'
        } else if (cards[0].factoryId !== cards[1].factoryId) {
            return 'Cards are different type'
        } else {
            return await this.setCardTier(cards[0], ++cards[0].tier)
        }
    }

    async setCardTier(card: any, tier: number) {
        const factoryDoc = this.fireStoreService.cardFactoryCollection.doc(card.factoryId.toString())
        const factory = (await factoryDoc.get()).data() || {}

        if(factory) {
            await this.fireStoreService.cardCollection.update(card.id, {
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
        const card = await this.fireStoreService.cardCollection.get(cardId)
        if(!card) {
            return
        }
        let nextTier = card.tier;
        switch (card.progression) {
            case Progression.TIERS:
            case Progression.CHAIN:
                nextTier = nextTier + 1;
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
                await this.fireStoreService.cardCollection.update(
                    cardId,
                    {
                        progression: Progression.NONE
                    }
                )
                await this.createCardFromFactory(factory, nextTier, newCardId);
                break;
            default:
                await this.createCardFromFactory(factory, nextTier, card.id);
        }
    }

    async updateCardUses(cardIds: string[]) {
        if(cardIds.length) {
            const cards = await this.fireStoreService.cardCollection.where('id', 'in', cardIds)
            cards.forEach((card) => {
                const newProgression = card.cardUses.progression + 1;
                this.fireStoreService.cardCollection.update(
                    card.id,
                    {
                        cardUses: {
                            ...card.cardUses,
                            progression: newProgression,
                            queue: card.cardUses.queue + 1,
                        }
                    }
                )
                if(card.progression !== Progression.NONE && newProgression >= card.cardUses.usesToProgress) {
                    this.progressCard(card.id)
                }
            })
        }
    }
}
