import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import {generateId, getRandomInt, tierToRoman} from "./helpers/util";
import {Logger} from "winston";
import CardFactory, {CardPrototype, Progression} from "../shared/interfaces/card-factory.interface";
import {Card, CardSnapshot, Report} from "../shared/classes/card.class";
import ScoreService from "./score.service";
import {RULES} from "../../definitions/rules";
import {StaticValidationService} from "../shared/services/validation.service";
import AthleteService from "./athlete.service";
import ActivityService from "./activity.service";
import {StaticAthleteHelperService} from "../shared/services/athlete.helper.service";
import Athlete from "../shared/classes/athlete.class";
import {Currencies} from "../shared/classes/currencies.class";
import {AbilityKey} from "../shared/interfaces/ability.interface";
import MathHelper from "./helpers/math.helper";
import {CARDS} from "../../definitions/cards";
import {ChallengeService} from "./challenge.service";
import { BOARD_KEY } from '../../definitions/scheme';

export default class CardService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger,
        private scoreService: ScoreService,
        private athleteService: AthleteService,
        private activityService: ActivityService,
        private challengeService: ChallengeService
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
                await this._activateCard(athleteId, cardId);
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
            await this.challengeService.progressCardUnlockChallenge(athleteId);
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

    async unlockBoardLevel(athleteId: string, boardKey: BOARD_KEY) {
        const athlete = await this.athleteService.getAthlete(athleteId);

        const currentMoney = athlete.currencies.coins || 0;
        const currentLevels = athlete.unlocks[boardKey] || [];
        const nextLevel = currentLevels.length;
        const price = Math.max(RULES.COINS.BASE_UNLOCK_PRICE -
            athlete.getPerkLevel(AbilityKey.CARD_UNLOCK_DISCOUNT) * RULES.UNLOCK_DISCOUNT_AMOUNT, 0)
        if(currentMoney < price) {
            this.logger.error(`Athlete ${athlete.logName} does not have ${price} (has ${currentMoney}) money to unlock ${boardKey} ${currentLevels.length}`);
            return;
        }
        const newUnlocks = {...athlete.unlocks};
        newUnlocks[boardKey] = [...currentLevels, nextLevel];

        athlete.currencies.coins = currentMoney - price;
        athlete.unlocks = newUnlocks;
        await this.athleteService.updateAthlete(athlete);

        this.logger.error(`Athlete ${athlete.logName} unlocked ${boardKey} ${nextLevel} for ${price} coins (had ${currentMoney}, now has ${currentMoney - price})`);
    }

    async claimCardRewards(athleteId: string, cardId: string) {
        const athlete = await this.athleteService.getAthlete(athleteId);
        const card = await this.getCard(cardId);
        await this.claimCard(athlete, cardId);
        await Promise.all([
            await this.scoreService.updateScore(athleteId, card),
            await this.claimCardCurrencies(athlete, card)
        ]);
    }

    async claimCardCurrencies(athlete: Athlete, card: Card) {
        const reward = card.rewards;
        reward.experience = reward.experience + ((athlete.perks[AbilityKey.EXPERIENCE_PER_TASK_BONUS] || 0) * RULES.TASK_EXTRA_EXPERIENCE);

        athlete.addCurrencies(reward);
        await this.athleteService.updateAthlete(athlete);

        this.logger.info(`Athlete ${athlete.logName} claimed ${reward.toString()} for card ${card.title}`);
        if(card.rewards.energy) {
            this.logger.error(`Athlete ${athlete.logName} restored ${card.rewards.energy} energy for card ${card.title}`);
        }
    }

    async _activateCard(athleteId: string, cardId: string) {
        const card = await this.getCard(cardId);
        const athlete = await this.athleteService.getAthlete(athleteId);

        if(StaticValidationService.notEnoughCoins(athlete.currencies.coins, athlete.currencies.fatigue)) {
            this.logger.info(`Athlete ${athlete.logName} don't have enough coins to activate card ${card.title}`);
            throw 'Not enough coins';
        }
        if(athlete.cards.active.length + 1 > RULES.SCHEME.MAX_ACTIVE_CARDS) {
            this.logger.info(`Athlete ${athlete.logName} has too much activated cards`);
            throw 'Too much active cards';
        }

        const coinsCost = StaticAthleteHelperService.getCardActivationCost(athlete.currencies.fatigue);
        athlete.cards.active = [...athlete?.cards.active, card.id];
        this.athleteService.spendCoins(athlete, coinsCost)

        await Promise.all([
            this.athleteService.increaseFatigue(athlete, card.energyCost),
            this.athleteService.updateAthlete(athlete)
        ])
        this.logger.info(`Athlete ${athlete.logName} has activated ${card.title} for ${card.energyCost} energy and ${coinsCost} coins`);
    }

    async claimCard(athlete: Athlete, cardId: string) {
        const completedCards = athlete.cards.completed;
        const claimedCards = athlete.cards.claimed;
        completedCards.splice((athlete?.cards.completed || []).indexOf(cardId), 1);
        claimedCards.push(cardId);
        athlete.cards.completed = completedCards;
        athlete.cards.claimed = claimedCards;
        return await this.athleteService.updateAthlete(athlete);
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
        // const card = Card.fromJSONObject(await this.fireStoreService.cardCollection.get(cardId.toString()));
        const card = CARDS.find(card => card.id === cardId);
        if(!card) {
            this.logger.error(`Card ${cardId} does not exist`);
            throw 'Card does not exist';
        } else {
            return card;
        }
    }

    async updateCard(card: Card) {
        await this.fireStoreService.cardCollection.update(card.id.toString(), card.toJSONObject());
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
            return Card.empty();
        }
        let newProgression = factory.progression;
        if ((factory.progression === Progression.CHAIN || factory.progression === Progression.TIERS) && Object.keys(factory.cards).length === tier + 1) {
            this.logger.info(`Card ${factory.title} tier ${tier} is final, switching progression to ${Progression.NONE}`)
            newProgression = Progression.NONE;
        }
        const card: Card = new Card(
            factory.title + ((factory.progression === Progression.CHAIN || factory.progression === Progression.TIERS) ? ' ' + tierToRoman(tier) : ''),
            factory.image || '',
            cardPrototype.tier,
            id,
            cardPrototype.description,
            new Currencies(
                MathHelper.toInt(cardPrototype.coinsReward),
                MathHelper.toInt(cardPrototype.value),
                MathHelper.toInt(cardPrototype.experienceReward),
                0,
                0,
                0,
                MathHelper.toInt(cardPrototype.energyReward),
                0,
                0
            ),
            MathHelper.toInt(cardPrototype.energyCost),
            MathHelper.toInt(cardPrototype.coinsCost),
            {
                progression: 0,
                usesToProgress: MathHelper.toInt(cardPrototype.usesToProgress)
            },
            factory.id,
            newProgression,
            cardPrototype.validators,
            factory.manualValidation,
            []
        );
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
        const claimed = owner.cards?.claimed.find(card => card == cardId);


        owner.currencies.coins = claimed ? (owner.currencies.coins || 0) - card.rewards.coins : owner.currencies.coins;
        owner.currencies.experience = claimed ? (owner.currencies.experience || 0) - card.rewards.experience : owner.currencies.experience;
        owner.baseCardProgress = StaticValidationService.updateBaseCardProgressFromCard(activity, card, owner.baseWorkout, owner.baseCardProgress);
        owner.cards.claimed = owner.cards.claimed.filter(card => card !== cardId);
        owner.cards.completed = owner.cards.completed.filter(card => card !== cardId);

        Promise.all([
            claimed ? await this.scoreService.updateScore(owner.id, card, true) : null,
            await this.athleteService.updateAthlete(owner),
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
