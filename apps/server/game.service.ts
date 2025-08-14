import {RESPONSES} from "./response-codes";
import fs from "fs";
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import AthleteService from "./athlete.service";
import {Logger} from "winston";
import schedule from "node-schedule";
import {RULES} from "../../definitions/rules";
import {getRandomInt} from "./helpers/util";
import ScoreService from "./score.service";
import CardService from "./card.service";
import Athlete from "../shared/classes/athlete.class";
import CardFactory from "../shared/interfaces/card-factory.interface";
import ActivityService from "./activity.service";
import Game from "../cards/src/app/interfaces/game";
import {DateService} from "../shared/utils/date.service";
import {ProgressiveChallenge} from "../shared/interfaces/progressive-challenge.interface";
import {ChallengeService} from "./challenge.service";
import MathHelper from "./helpers/math.helper";
import {Card} from "../shared/classes/card.class";

export default class GameService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger,
        private athleteService: AthleteService,
        private scoreService: ScoreService,
        private cardService: CardService,
        private activityService: ActivityService,
        private challengeService: ChallengeService
    ) {
        app.post(`${CONST.API_PREFIX}/start-game`, async (req, res) => {
            const startDate = req.body?.startDate;
            await this.startGame(startDate)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });

        app.get(`${CONST.API_PREFIX}/creatures`, (req, res) => {
            try {
                let data = fs.readFileSync('creatures.json', 'utf8')
                res.status(200).send(data);
            } catch (err) {
                res.status(500).send(err);
            }
        });

        this.staleActivityCleanup();
        this.initEnergyRegen();
        if(RULES.FEATURED_CARD_ENABLED) {
            this.initFeaturedCardChange();
        }
        if(RULES.PROGRESSIVE_CHALLENGE.ENABLED) {
            this.initChallengeAddition();
        }

        this.migration();
    }

    async migration() {
        // console.log('running migration');
    }

    staleActivityCleanup() {
        const rule = new schedule.RecurrenceRule();
        rule.hour = [
            0, 1, 2, 3, 4, 5,
            6, 7, 8, 9, 10,11,
            12,13,14,15,16,17,
            18,19,20,21,22,23
        ];

        rule.minute = 0;
        rule.tz = CONST.TIMEZONE;

        const job = schedule.scheduleJob(rule, async () => {
            this.logger.info(`Submitting stale activities`);
            const allAthletes = (await this.fireStoreService.athleteCollection.all()).map((athlete: Athlete) => Athlete.fromJSONObject(athlete));
            allAthletes.map(async (athlete: Athlete) => {
                await this.activityService.submitAllActivities(athlete.id);
            })
        })
    }

    initEnergyRegen() {
        const rule = new schedule.RecurrenceRule();
        rule.hour = 0;
        rule.minute = 0;
        rule.tz = CONST.TIMEZONE;

        const job = schedule.scheduleJob(rule, async () => { // TODO big issue with lots of .updateAthlete() calls
            this.logger.error(`It's midnight`);
            const allAthletes = (await this.fireStoreService.athleteCollection.all()).map((athlete: Athlete) => Athlete.fromJSONObject(athlete));
            allAthletes.map(async (athlete: Athlete) => {
                const updatedAthlete = await this.athleteService.getAthlete(athlete.id); // Updated instance after submit
                try {
                    updatedAthlete.addEnergy(RULES.ENERGY.TIMED_RESTORE);
                } catch (e) {
                    this.logger.error(`Can't restore energy for ${updatedAthlete.logName}: ${e}`);
                }
                this.athleteService.triggerPerks(updatedAthlete);
                await this.athleteService.updateAthlete(updatedAthlete);
                await this.claimAllRewards(updatedAthlete.id);
                // await this.challengeService.resetDailyChallenges(updatedAthlete.id); // Not used this time
            })
        })
    }

    initFeaturedCardChange() {
        const rule = new schedule.RecurrenceRule();
        rule.hour = RULES.FEATURED_TASK_HOURS.REGULAR;
        rule.minute = 0;
        rule.tz = 'Europe/Riga';

        const job = schedule.scheduleJob(rule, async () => {
            const game: Game | null = await this.fireStoreService.gameCollection.get(CONST.GAME_ID);
            if(game?.startDate === DateService.getToday() && RULES.FEATURED_TASK_HOURS.FIRST_DAY.indexOf(DateService.getCurrentHour()) === -1) {
                return;
            }
            await this.changeFeaturedCard();
        })
    }

    initChallengeAddition() {
        const rule = new schedule.RecurrenceRule();
        rule.hour = RULES.PROGRESSIVE_CHALLENGE.HOURS.REGULAR;
        rule.minute = 0;
        rule.tz = 'Europe/Riga';

        const job = schedule.scheduleJob(rule, async () => {
            const game: Game | null = await this.fireStoreService.gameCollection.get(CONST.GAME_ID);
            if(game?.startDate === DateService.getToday() && RULES.PROGRESSIVE_CHALLENGE.HOURS.FIRST_DAY.indexOf(DateService.getCurrentHour()) === -1) {
                return;
            }
            await this.pushNewChallenges();
        })
    }

    async pushNewChallenges() {
        const game: Game | null = await this.fireStoreService.gameCollection.get(CONST.GAME_ID);
        if(!game) {
            return;
        }
        const activeChallenges: string[] = game.activeChallenges || [];
        const allChallenges: ProgressiveChallenge[] = await this.fireStoreService.challengeCollection.all();
        const availableChallenges = allChallenges.filter((challenge: ProgressiveChallenge) => activeChallenges.indexOf(challenge.id) === -1);
        let newChallenges = [];
        if(availableChallenges.length > RULES.PROGRESSIVE_CHALLENGE.NEW_DAILY) {
            for(let i = 0; i < RULES.PROGRESSIVE_CHALLENGE.NEW_DAILY; i++) {
                newChallenges.push(availableChallenges.splice(getRandomInt(availableChallenges.length), 1)[0]);
            }
        } else if (availableChallenges.length > 0) {
            newChallenges = availableChallenges;
        } else {
            this.logger.error(`Can't add new challenges, all challenges are already active.`);
            return;
        }
        await this.fireStoreService.gameCollection.update(CONST.GAME_ID,
            {
                activeChallenges: [...activeChallenges, ...newChallenges.map((challenge: ProgressiveChallenge) => challenge.id)]
            }
        );
        this.logger.info(`New challenges added:  ${newChallenges.map((challenge: ProgressiveChallenge) => challenge.title).join(', ')}`);
    }

    async changeFeaturedCard(cardName = '') {
        const allFactories: CardFactory[] = await this.fireStoreService.cardFactoryCollection
            .whereQuery([{ fieldPath: 'manualValidation', opStr: '==', value: true}]);
        const namedFactory = cardName && allFactories.find((factory: CardFactory) => factory.title === cardName);
        const randomFactory = allFactories[getRandomInt(allFactories.length)];
        const newCard = await this.cardService.createCardFromFactory(namedFactory || randomFactory, 0);

        Promise.all([
            await this.fireStoreService.cardCollection.update(
                newCard.id,
                {
                    title: `${newCard.title} (Time Limited)`,
                    value: 0,
                    coinsReward: MathHelper.toInt(newCard.rewards.coins) + (MathHelper.toInt(newCard.rewards.points) * RULES.COINS.FEATURED_CARD_POINT_CONVERSION),
                    energyCost: 0
                }
            ),
            await this.fireStoreService.gameCollection.update(
                CONST.GAME_ID,
                {
                    featuredCard: newCard.id
                }
            )
        ])
        this.logger.error(`New featured card ${newCard.title}`);
    }

    async claimAllRewards(athleteId: string) {
        const athlete = await this.athleteService.getAthlete(athleteId);

        for(let i = 0; i < (athlete.cards?.completed || []).length; i++) {
            await this.cardService.claimCardRewards(athleteId, athlete.cards.completed[i]);
        }
        for(let i = 0; i < Object.values(CONST.ACTIVITY_TYPES).length; i++) {
            await this.athleteService.claimBaseReward(athleteId, Object.values(CONST.ACTIVITY_TYPES)[i]);
        }
    }

    async startGame(startDate: string) {
        const game: Game = {
            cardUses: 0,
            shifts: 0,
            startDate,
            featuredCard: null,
            activeChallenges: []
        }
        await this.fireStoreService.gameCollection.set(
            CONST.GAME_ID,
            game
        )
        if(RULES.FEATURED_CARD_ENABLED) {
            await this.changeFeaturedCard(RULES.STARTING_CARD)
        }
        if(RULES.PROGRESSIVE_CHALLENGE.ENABLED) {
            await this.pushNewChallenges();
        }
    }
}
