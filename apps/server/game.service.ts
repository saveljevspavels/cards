import {RESPONSES} from "./response-codes";
import fs from "fs";
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import {AbilityKey} from "../shared/interfaces/ability.interface";
import AthleteService from "./athlete.service";
import {Logger} from "winston";
import {ABILITIES} from "../../definitions/abilities";
import schedule from "node-schedule";
import {RULES} from "../../definitions/rules";
import {getRandomInt} from "./helpers/util";
import ScoreService from "./score.service";
import CardService from "./card.service";
import Athlete from "../shared/interfaces/athlete.interface";
import CardFactory from "../shared/interfaces/card-factory.interface";
import ActivityService from "./activity.service";

export default class GameService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger,
        private athleteService: AthleteService,
        private scoreService: ScoreService,
        private cardService: CardService,
        private activityService: ActivityService
    ) {
        app.post(`${CONST.API_PREFIX}/start-game`, async (req, res) => {
            await fireStoreService.startGame()
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

        app.post(`${CONST.API_PREFIX}/game/ability`,async (req, res) => {
            const abilityKey = req.body?.abilityKey;
            const athleteId = res.get('athleteId');
            if(!abilityKey || !athleteId) {
                res.status(400).send('Ability Key or Athlete Id missing');
                return;
            }
            try {
                await this.useAbility(athleteId, abilityKey);
            } catch (err) {
                res.status(400).send(err);
            }
            res.status(200).send();
        });

        this.initEnergyRegen();
        this.initFeaturedCardChange();
    }

    initEnergyRegen() {
        const rule = new schedule.RecurrenceRule();
        rule.hour = 0;
        rule.minute = 0;
        rule.tz = 'Europe/Riga';

        const job = schedule.scheduleJob(rule, async () => {
            this.logger.error(`It's midnight`);
            const allAthletes = await this.fireStoreService.athleteCollection.all();
            allAthletes.map(async (athlete: Athlete) => {
                await this.activityService.submitAllActivities(athlete.id);
                await this.athleteService.addEnergy(athlete.id, RULES.ENERGY.TIMED_RESTORE);
                await this.claimAllRewards(athlete.id);
            })
        })
    }

    initFeaturedCardChange() {
        const rule = new schedule.RecurrenceRule();
        rule.hour = RULES.FEATURED_TASK_HOURS;
        rule.minute = 0;
        rule.tz = 'Europe/Riga';

        const job = schedule.scheduleJob(rule, async () => {
            await this.changeFeaturedCard();
        })
    }

    async changeFeaturedCard() {
        const allFactories: CardFactory[] = await this.fireStoreService.cardFactoryCollection
            .where([{ fieldPath: 'manualValidation', opStr: '==', value: true}]);
        const randomFactory = allFactories[getRandomInt(allFactories.length)];
        const newCard = await this.cardService.createCardFromFactory(randomFactory, 0);

        Promise.all([
            await this.fireStoreService.cardCollection.update(
                newCard.id,
                {
                    title: `${newCard.title} (Time Limited)`,
                    value: 0,
                    coinsReward: parseInt(String(newCard.coinsReward), 10) + (parseInt(String(newCard.value), 10) * RULES.COINS.FEATURED_CARD_POINT_CONVERSION),
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

    async useAbility(athleteId: string, abilityKey: AbilityKey) {
        const athlete = await this.athleteService.getAthlete(athleteId);
        const ability = ABILITIES.find(ability => ability.key === abilityKey);
        if(!ability) {
            this.logger.info(`Athlete ${athlete.name} tried to activate invalid activity: ${abilityKey}`);
            throw 'Invalid ability';
        }
        if(athlete.usedAbilities.indexOf(abilityKey) !== -1) {
            this.logger.info(`Athlete ${athlete.name} already used ability ${abilityKey}`);
            throw 'Already used';
        }

        Promise.all([
            ability.coinsCost && await this.athleteService.spendCoins(athleteId, ability.coinsCost),
            ability.energyCost && await this.athleteService.spendEnergy(athleteId, ability.energyCost),
            await this.fireStoreService.athleteCollection.update(
                athleteId,
                {
                    usedAbilities: [
                        ...athlete.usedAbilities,
                        abilityKey
                    ]
                }
            )
        ])

        switch (abilityKey) {
            case AbilityKey.REDUCE_BASE_WORKOUT:
                await this.fireStoreService.updateBaseWorkout(
                    [athleteId],
                    {
                        run: {
                            distance: Math.ceil((athlete.baseWorkout.run?.distance || RULES.DEFAULT_BASE_WORKOUT.run.distance) * 0.9),
                        },
                        ride: {
                            distance: Math.ceil((athlete.baseWorkout.ride?.distance || RULES.DEFAULT_BASE_WORKOUT.ride.distance) * 0.9),
                        },
                        walk: {
                            distance: Math.ceil((athlete.baseWorkout.walk?.distance || RULES.DEFAULT_BASE_WORKOUT.walk.distance) * 0.9),
                        }
                    }
                )
                break;
            case AbilityKey.RESET_CARD:
                break;
        }

        Promise.all([
            ability.coinsReward && await this.athleteService.spendCoins(athleteId, -ability.coinsReward),
            ability.energyReward && await this.athleteService.addEnergy(athleteId, ability.energyReward),
            ability.value && await this.scoreService.addPoints(athleteId, ability.value)
        ]);
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
}
