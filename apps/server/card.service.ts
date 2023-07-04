import {RESPONSES} from "./response-codes";
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import {generateId, getRandomInt, tierToRoman} from "./helpers/util";
import {Logger} from "winston";
import CardFactory, {CardPrototype, Progression} from "../shared/interfaces/card-factory.interface";
import Card, {CardSnapshot} from "../shared/interfaces/card.interface";
import ScoreService from "./score.service";
import {RULES} from "../../definitions/rules";
import {StaticValidationService} from "../shared/services/validation.service";
import AthleteService from "./athlete.service";
import ActivityService from "./activity.service";

export default class CardService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger,
        private scoreService: ScoreService,
        private athleteService: AthleteService,
        private activityService: ActivityService
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
                return;
            }
            try {
                await this.activateCard(athleteId, cardId);
            } catch (err) {
                res.status(400).send(err);
            }
            res.status(200).send();
        });

        app.post(`${CONST.API_PREFIX}/cards/claim-reward`,async (req, res) => {
            const cardId = req.body?.cardId;
            const athleteId = res.get('athleteId');
            if(!cardId || !athleteId) {
                res.status(400).send('Card Id or Athlete Id missing');
                return;
            }

            try {
                const athlete = await this.athleteService.getAthlete(athleteId);
                if(athlete?.cards.completed.indexOf(cardId) === -1) {
                    res.status(400).send('Card is not completed');
                    return;
                }
                if(!await this.fireStoreService.cardCollection.exists(cardId)) {
                    res.status(400).send('Card does not exist');
                    return
                }

                await Promise.all([
                    await this.finishCard(athleteId, cardId),
                    await this.scoreService.updateScore(athleteId, cardId),
                    await this.claimCardRewards(athleteId, cardId)
                ]);
            } catch (err) {
                res.status(400).send(err);
            }
            res.status(200).send();
        });

        app.post(`${CONST.API_PREFIX}/cards/unlock-level`,async (req, res) => {
            const boardKey = req.body?.boardKey;
            const level = req.body?.level;
            const athleteId = res.get('athleteId');
            if(!boardKey || !athleteId || !level) {
                res.status(400).send('Board Key/Level or Athlete Id missing');
                return;
            }
            await this.unlockBoardLevel(athleteId, boardKey, level);
            res.status(200).send();
        });

        app.post(`${CONST.API_PREFIX}/cards/report`,async (req, res) => {
            const cardId = req.body?.cardId;
            const activityId = req.body?.activityId.toString();
            const comment = req.body?.comment;
            const athleteId = res.get('athleteId');
            if(!cardId || !athleteId || !activityId) {
                res.status(400).send('Card Id/Activity Id or Athlete Id missing');
                return;
            }
            try {
                await this.reportCard(athleteId, cardId, activityId, comment);
            } catch (err) {
                res.status(400).send(err);
            }
            res.status(200).send();
        });

        app.post(`${CONST.API_PREFIX}/cards/like`,async (req, res) => {
            const cardId = req.body?.cardId;
            const activityId = req.body?.activityId.toString();
            const athleteId = res.get('athleteId');
            if(!cardId || !athleteId || !activityId) {
                res.status(400).send('Card Id/Activity Id or Athlete Id missing');
                return;
            }
            try {
                await this.likeCard(athleteId, cardId, activityId);
            } catch (err) {
                res.status(400).send(err);
            }
            res.status(200).send();
        });

        app.post(`${CONST.API_PREFIX}/cards/reject`,async (req, res) => {
            const cardId = req.body?.cardId;
            const activityId = req.body?.activityId?.toString();
            const comment = req.body?.comment;
            if(!cardId || !activityId) {
                res.status(400).send('Card Id/Activity Id missing');
                return;
            }
            try {
                await this.rejectCard(cardId, activityId, comment);
            } catch (err) {
                res.status(400).send(err);
            }
            res.status(200).send();
        });
    }

    async unlockBoardLevel(athleteId: string, boardKey: string, level: number) {
        const athlete = await this.athleteService.getAthlete(athleteId);

        const currentMoney = athlete.coins || 0;
        const currentLevel = athlete.unlocks[boardKey] || 0;
        if(currentLevel >= level) {
            this.logger.error(`${boardKey} level ${level} already unlocked for athlete ${athlete.firstname} ${athlete.lastname}`);
            return;
        }
        const price = (level - currentLevel) * RULES.COINS.PER_LEVEL_PRICE;
        if(currentMoney < price) {
            this.logger.error(`Athlete ${athlete.firstname} ${athlete.lastname} does not have ${price} (has ${currentMoney}) money to unlock ${boardKey} ${level}`);
            return;
        }
        const newUnlocks = {...athlete.unlocks};
        newUnlocks[boardKey] = level;
        await this.fireStoreService.athleteCollection.update(
            athleteId,
            {
                coins: currentMoney - price,
                unlocks: newUnlocks
            }
        )
        this.logger.error(`Athlete ${athlete.firstname} ${athlete.lastname} unlocked ${boardKey} ${level} for ${price} coins (had ${currentMoney}, now has ${currentMoney - price})`);
    }

    async claimCardRewards(athleteId: string, cardId: string) {
        const athlete = await this.athleteService.getAthlete(athleteId);
        const card = await this.getCard(cardId);
        const newEnergy = parseInt(String(athlete.energy)) + parseInt(String(card.energyReward));
        let bonusCoins = 0;
        if(newEnergy > RULES.ENERGY.MAX) {
            bonusCoins = (newEnergy - RULES.ENERGY.MAX) * RULES.COINS.PER_ENERGY_CONVERSION;
        }
        await this.fireStoreService.athleteCollection.update(
            athleteId,
            {
                coins: parseInt(String(athlete.coins), 10) + parseInt(String(card.coinsReward), 10) + bonusCoins,
                energy: Math.min(newEnergy, RULES.ENERGY.MAX),
            }
        )
        this.logger.error(`Athlete claimed ${parseInt(String(card.coinsReward), 10) + bonusCoins} coins for card ${card.title}`);
        if(parseInt(String(card.energyReward))) {
            this.logger.error(`Athlete restored ${card.energyReward} energy for card ${card.title}`);
        }
    }

    async activateCard(athleteId: string, cardId: string) {
        const card = await this.getCard(cardId);
        const athlete = await this.athleteService.getAthlete(athleteId);
        if(parseInt(String(athlete.energy), 10) < parseInt(String(card.energyCost), 10)) {
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} don't have enough energy to activate card ${card.title}`);
            throw 'Not enough energy';
        }
        if(athlete.cards.active.length + 1 > RULES.SCHEME.MAX_ACTIVE_CARDS) {
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} has too much activated cards`);
            throw 'Too much active cards';
        }
        await this.fireStoreService.athleteCollection.update(athleteId, {
            cards: {
                ...athlete.cards,
                active: [...athlete?.cards.active, card.id]
            },
            energy: parseInt(String(athlete.energy), 10) - parseInt(String(card.energyCost), 10)
        })
    }

    async finishCard(athleteId: string, cardId: string) {
        const athlete = await this.athleteService.getAthlete(athleteId);
        const completedCards = athlete.cards.completed;
        const finishedCards = athlete.cards.finished;
        completedCards.splice(athlete?.cards.completed.indexOf(cardId), 1);
        finishedCards.push(cardId);
        await this.fireStoreService.athleteCollection.update(athleteId, {
            cards: {
                ...athlete.cards,
                completed: completedCards,
                finished: finishedCards
            }
        });
    }

    async getCards(cardIds: string[]): Promise<Card[] | []> {
        return await this.fireStoreService.cardCollection.where([{fieldPath: 'id', opStr: 'in', value: cardIds}]);
    }

    async getCard(cardId: string): Promise<Card> {
        const card = await this.fireStoreService.cardCollection.get(cardId);
        if(!card) {
            this.logger.error(`Card ${cardId} does not exist`);
            throw 'Card does not exist';
        } else {
            return card;
        }
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
                progression: 0
            },
            validators: cardPrototype.validators
        }
        await this.fireStoreService.cardCollection.set(id, card)

        this.logger.info(`Created ${factory.title} card ${id}, ${tier} tier`)
    }

    async combineCards(athleteId: string, cardIds: string[]) {
        const cards: Card[] = await this.fireStoreService.cardCollection.where([{ fieldPath: 'id', opStr: 'in', value: cardIds}]);
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
        const card = await this.getCard(cardId);
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
            const cards = await this.fireStoreService.cardCollection.where([{ fieldPath: 'id', opStr: 'in', value: cardIds}])
            cards.forEach((card) => {
                const newProgression = card.cardUses.progression + 1;
                this.fireStoreService.cardCollection.update(
                    card.id,
                    {
                        cardUses: {
                            ...card.cardUses,
                            progression: newProgression,
                        }
                    }
                )
                if(card.progression !== Progression.NONE && newProgression >= card.cardUses.usesToProgress) {
                    this.progressCard(card.id)
                }
            })
        }
    }

    async reportCard(athleteId: string, cardId: string, activityId: string, comment: string) {
        const activity = await this.activityService.getActivity(activityId);
        const gameData = activity.gameData;
        const card: CardSnapshot = gameData.cardSnapshots.find((cardSnapshot: CardSnapshot) => cardSnapshot.id === cardId)
        if(!card) {
            this.logger.info(`Card snapshot ${cardId} does not exist in activity ${activityId}`);
            throw 'Card snapshot does not exist in activity';
        }

        if(!card.reports) {
            card.reports = {};
        }
        card.reports[athleteId] = comment;

        await this.fireStoreService.detailedActivityCollection.update(
            activityId,
            {
                gameData
            }
        )
        this.logger.info(`Card ${card.title} reported for athlete ${activity.athlete.id} by ${athleteId}, comment: ${comment}`);
    }

    async likeCard(athleteId: string, cardId: string, activityId: string) {
        const activity = await this.activityService.getActivity(activityId);
        const gameData = activity.gameData;
        const card: CardSnapshot = gameData.cardSnapshots.find((cardSnapshot: CardSnapshot) => cardSnapshot.id === cardId)
        if(!card) {
            this.logger.info(`Card snapshot ${cardId} does not exist in activity ${activityId}`);
            throw 'Card snapshot does not exist in activity';
        }

        if(!card.likes) {
            card.likes = {};
        }
        card.likes[athleteId] = true;

        await this.fireStoreService.detailedActivityCollection.update(
            activityId,
            {
                gameData
            }
        )
        // this.logger.info(`Card ${card.title} liked for athlete ${activity.athlete.id} by ${athleteId}`);
    }

    async rejectCard(cardId: string, activityId: string, comment: string) {
        const activity = await this.activityService.getActivity(activityId);
        const gameData = activity.gameData;
        const card: CardSnapshot = gameData.cardSnapshots.find((cardSnapshot: CardSnapshot) => cardSnapshot.id === cardId)
        if(!card) {
            this.logger.info(`Card snapshot ${cardId} does not exist in activity ${activityId}`);
            throw 'Card snapshot does not exist in activity';
        }
        const owner = await this.athleteService.getAthlete(activity.athlete.id);

        Promise.all([
            await this.scoreService.updateScore(owner.id, cardId, true),
            await this.fireStoreService.athleteCollection.update(
                owner.id,
                {
                    coins: owner.coins - card.coinsReward,
                    baseCardProgress: StaticValidationService.updateBaseCardProgressFromCard(activity.type, card, owner.baseWorkout, owner.baseCardProgress),
                    cards: {
                        ...owner.cards,
                        finished: owner.cards?.finished.filter(card => card !== cardId),
                        completed: owner.cards?.completed.filter(card => card !== cardId),
                    }
                }
            ),
            await this.fireStoreService.detailedActivityCollection.update(
                activityId,
                {
                    gameData: {
                        ...gameData,
                        cardSnapshots: gameData.cardSnapshots.filter((cardSnapshot: CardSnapshot) => cardSnapshot.id !== cardId)
                    },
                }
            )
        ])

        this.logger.info(`Card ${card.title} rejected for athlete ${activity.athlete.id}, comment: ${comment}`);
    }
}
