import {RESPONSES} from "./response-codes";
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import {generateId, getRandomInt, tierToRoman} from "./helpers/util";
import {Logger} from "winston";
import CardFactory, {CardPrototype, Progression} from "../shared/interfaces/card-factory.interface";
import Card, {CardSnapshot, NullCard, Report} from "../shared/interfaces/card.interface";
import ScoreService from "./score.service";
import {RULES} from "../../definitions/rules";
import {StaticValidationService} from "../shared/services/validation.service";
import AthleteService from "./athlete.service";
import ActivityService from "./activity.service";
import {StaticAthleteHelperService} from "../shared/services/athlete.helper.service";

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

                await this.claimCardRewards(athleteId, cardId);
            } catch (err) {
                res.status(400).send(err);
            }
            res.status(200).send();
        });

        app.post(`${CONST.API_PREFIX}/cards/unlock-level`,async (req, res) => {
            const boardKey = req.body?.boardKey;
            const athleteId = res.get('athleteId');
            if(!boardKey || !athleteId) {
                res.status(400).send('Board Key or Athlete Id missing');
                return;
            }
            await this.unlockBoardLevel(athleteId, boardKey);
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

        app.post(`${CONST.API_PREFIX}/cards/resolve-report`,async (req, res) => {
            const cardId = req.body?.cardId;
            const activityId = req.body?.activityId.toString();
            const reportId = req.body?.reportId.toString();
            if(!cardId || !activityId) {
                res.status(400).send('Card Id/Activity Id missing');
                return;
            }
            try {
                await this.resolveReport(cardId, activityId, reportId);
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

        app.post(`${CONST.API_PREFIX}/cards/delete`,async (req, res) => {
            const cardIds = req.body?.cardIds;
            const athleteId = res.get('athleteId');
            if(!cardIds) {
                res.status(400).send('Card Ids missing');
                return;
            }
            try {
                await this.deleteCards(cardIds);
                this.logger.error(`Athlete ${athleteId} deleted cards ${cardIds}`);
            } catch (err) {
                res.status(400).send(err);
            }
            res.status(200).send();
        });
    }

    async unlockBoardLevel(athleteId: string, boardKey: string) {
        const athlete = await this.athleteService.getAthlete(athleteId);

        const currentMoney = athlete.coins || 0;
        const currentLevel = athlete.unlocks[boardKey] || 0;
        const nextLevel = currentLevel + 1;
        const price = RULES.COINS.BASE_UNLOCK_PRICE + (nextLevel * RULES.COINS.PER_LEVEL_PRICE);
        if(currentMoney < price) {
            this.logger.error(`Athlete ${athlete.firstname} ${athlete.lastname} does not have ${price} (has ${currentMoney}) money to unlock ${boardKey} ${currentLevel + 1}`);
            return;
        }
        const newUnlocks = {...athlete.unlocks};
        newUnlocks[boardKey] = nextLevel;
        await this.fireStoreService.athleteCollection.update(
            athleteId,
            {
                coins: currentMoney - price,
                unlocks: newUnlocks
            }
        )
        this.logger.error(`Athlete ${athlete.firstname} ${athlete.lastname} unlocked ${boardKey} ${nextLevel} for ${price} coins (had ${currentMoney}, now has ${currentMoney - price})`);
    }

    async claimCardRewards(athleteId: string, cardId: string) {
        await this.finishCard(athleteId, cardId);
        await Promise.all([
            await this.scoreService.updateScore(athleteId, cardId),
            await this.claimCardCoins(athleteId, cardId)
        ]);
    }

    async claimCardCoins(athleteId: string, cardId: string) {
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
        this.logger.info(`Athlete ${athlete.name} claimed ${parseInt(String(card.coinsReward), 10) + bonusCoins} coins for card ${card.title}`);
        if(parseInt(String(card.energyReward))) {
            this.logger.error(`Athlete restored ${card.energyReward} energy for card ${card.title}`);
        }
    }

    async activateCard(athleteId: string, cardId: string) {
        const card = await this.getCard(cardId);
        const athlete = await this.athleteService.getAthlete(athleteId);

        if(StaticValidationService.notEnoughCoins(athlete.coins, athlete.fatigue)) {
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} don't have enough coins to activate card ${card.title}`);
            throw 'Not enough coins';
        }
        if(athlete.cards.active.length + 1 > RULES.SCHEME.MAX_ACTIVE_CARDS) {
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} has too much activated cards`);
            throw 'Too much active cards';
        }

        await Promise.all([
            this.athleteService.spendCoins(athlete, StaticAthleteHelperService.getCardActivationCost(athlete.fatigue)),
            this.athleteService.increaseFatigue(athlete, card.energyCost),
            this.fireStoreService.athleteCollection.update(athleteId, {
                cards: {
                    ...athlete.cards,
                    active: [...athlete?.cards.active, card.id]
                },
                coins: parseInt(String(athlete.coins), 10) - parseInt(String(card.coinsCost), 10)
            })
        ])
        this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} has activated ${card.title} for ${card.energyCost} energy and ${card.coinsCost} coins`);
    }

    async finishCard(athleteId: string, cardId: string) {
        const athlete = await this.athleteService.getAthlete(athleteId);
        const completedCards = athlete.cards.completed;
        const finishedCards = athlete.cards.finished;
        completedCards.splice(athlete?.cards.completed.indexOf(cardId), 1);
        finishedCards.push(cardId);
        return await this.fireStoreService.athleteCollection.update(athleteId, {
            cards: {
                ...athlete.cards,
                completed: completedCards,
                finished: finishedCards
            }
        });
    }

    async deleteCards(cardIds: string[]): Promise<void> {
        for(let i = 0; i < cardIds.length; i++) {
            await this.fireStoreService.cardCollection.delete(cardIds[i]);
        }
    }

    async getCards(cardIds: string[]): Promise<Card[] | []> {
        return await this.fireStoreService.cardCollection.whereQuery([{fieldPath: 'id', opStr: 'in', value: cardIds}]);
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
        return this.fireStoreService.cardFactoryCollection.set(
            id,
            {
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
        const cardFactories: CardFactory[] = (await this.fireStoreService.cardFactoryCollection.all() || []).filter((factory: CardFactory) => cardFactoryIds.indexOf(factory.id) !== -1);

        cardFactories.forEach(((factory: CardFactory) => {
            for(let i = 0; i < amount; i++) {
                this.createCardFromFactory(factory, tier)
            }
        }))
    }

    async createCardFromFactory(factory: CardFactory, tier: number, id = generateId()): Promise<Card> {
        let cardPrototype: CardPrototype = factory.progression === Progression.FLAT
            ? factory.cards[getRandomInt(Object.keys(factory.cards).length)] // Random card for flat progression
            : factory.cards[tier]
        if(!cardPrototype) {
            this.logger.error(`Card ${factory.title} tier ${tier} not defined`)
            return NullCard;
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
            value: parseInt(cardPrototype.value.toString(), 10),
            tier: cardPrototype.tier,
            description: cardPrototype.description,
            energyCost: parseInt(cardPrototype.energyCost.toString(), 10),
            energyReward: parseInt(cardPrototype.energyReward.toString(), 10),
            coinsCost: parseInt(cardPrototype.coinsCost.toString(), 10),
            coinsReward: parseInt(cardPrototype.coinsReward.toString(), 10),
            cardUses: {
                usesToProgress: cardPrototype.usesToProgress,
                progression: 0
            },
            validators: cardPrototype.validators
        }
        await this.fireStoreService.cardCollection.set(id, card)

        this.logger.info(`Created ${factory.title} card ${id}, ${tier} tier`)
        return card;
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
        const factory: CardFactory | null = await this.fireStoreService.cardFactoryCollection.get(card.factoryId);
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
            const cards = await this.fireStoreService.cardCollection.whereQuery([{ fieldPath: 'id', opStr: 'in', value: cardIds}])
            cards.forEach((card: Card) => {
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
        const card = gameData.cardSnapshots.find((cardSnapshot: CardSnapshot) => cardSnapshot.id === cardId)
        if(!card) {
            this.logger.info(`Card snapshot ${cardId} does not exist in activity ${activityId}`);
            throw 'Card snapshot does not exist in activity';
        }

        if(!card.reports) {
            card.reports = [];
        }
        card.reports.push(this.createReport(athleteId, comment))

        await this.fireStoreService.detailedActivityCollection.update(
            activityId,
            {
                gameData
            }
        )
        this.logger.info(`Card ${card.title} reported for athlete ${activity.athlete.id} by ${athleteId}, comment: ${comment}`);
    }

    async resolveReport(cardId: string, activityId: string, reportId: string) {
        const activity = await this.activityService.getActivity(activityId);
        const gameData = activity.gameData;
        const card = gameData.cardSnapshots.find((cardSnapshot: CardSnapshot) => cardSnapshot.id === cardId)
        if(!card) {
            this.logger.info(`Card snapshot ${cardId} does not exist in activity ${activityId}`);
            throw 'Card snapshot does not exist in activity';
        }

        const report = card.reports?.find((report: Report) => report.id === reportId);
        if(!report) {
            this.logger.info(`Card snapshot ${cardId} has no reports`);
            throw 'Report does not exist';
        }

        report.resolved = true;

        await this.fireStoreService.detailedActivityCollection.update(
            activityId,
            {
                gameData
            }
        )
        this.logger.info(`Report resolved for card ${card.title} for athlete ${activity.athlete.id}`);
    }

    async likeCard(athleteId: string, cardId: string, activityId: string) {
        const activity = await this.activityService.getActivity(activityId);
        const gameData = activity.gameData;
        const card = gameData.cardSnapshots.find((cardSnapshot: CardSnapshot) => cardSnapshot.id === cardId)
        if(!card) {
            this.logger.info(`Card snapshot ${cardId} does not exist in activity ${activityId}`);
            throw 'Card snapshot does not exist in activity';
        }

        if(!card.likes) {
            card.likes = [];
        }
        if(card.likes.indexOf(athleteId) !== -1) {
            this.logger.info(`Athlete ${athleteId} tried to like card more than once`);
            throw 'Already liked by you';
        }

        card.likes.push(athleteId);

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
        const card = gameData.cardSnapshots.find((cardSnapshot: CardSnapshot) => cardSnapshot.id === cardId)
        if(!card) {
            this.logger.info(`Card snapshot ${cardId} does not exist in activity ${activityId}`);
            throw 'Card snapshot does not exist in activity';
        }
        const owner = await this.athleteService.getAthlete(activity.athlete.id);
        const finished = owner.cards?.finished.find(card => card == cardId);

        Promise.all([
            finished ? await this.scoreService.updateScore(owner.id, cardId, true) : null,
            await this.fireStoreService.athleteCollection.update(
                owner.id,
                {
                    coins: finished ? owner.coins - card.coinsReward : owner.coins,
                    baseCardProgress: StaticValidationService.updateBaseCardProgressFromCard(activity, card, owner.baseWorkout, owner.baseCardProgress),
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

    createReport(athleteId: string, comment: string): Report {
        return {
            id: generateId(),
            createdBy: athleteId,
            comment,
            resolved: false
        }
    }
}
