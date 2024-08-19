import {RESPONSES} from "./response-codes";
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import {RULES} from "../../definitions/rules";
import {Logger} from "winston";
import {StaticValidationService} from "../shared/services/validation.service";
import {Card, CardSnapshot} from "../shared/classes/card.class";
import Athlete, {BaseCardProgress} from "../shared/classes/athlete.class";
import AthleteService from "./athlete.service";
import {UploadedImage} from "../shared/interfaces/image-upload.interface";
import {ChallengeService} from "./challenge.service";
import {Activity, ActivityStatus} from "../shared/interfaces/activity.interface";
import {forkJoin} from "rxjs";
import axios from "axios";
import MathHelper from "./helpers/math.helper";
import {CARDS} from "../../definitions/cards";

export default class ActivityService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger,
        private athleteService: AthleteService,
        private challengeService: ChallengeService,
    ) {
        app.post(`${CONST.API_PREFIX}/submit-activity`, async (req, res) => {
            try {
                await this.submitActivity(
                    req.body.activityId,
                    req.body.cardIds,
                    req.body.images,
                    req.body.comments
                )
                await this.tryAutoApprove(req.body.activityId)
            } catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
            res.status(200).send();
        });

        app.post(`${CONST.API_PREFIX}/reject-activity`, async (req, res) => {
            await this.rejectActivity(req.body.activityId, req.body.comments)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });

        app.post(`${CONST.API_PREFIX}/activity/boost`, async (req, res) => {
            const activity = await this.getActivity(req.body.activityId);
            const athlete = await this.athleteService.getAthlete(activity.athlete.id.toString());
            if(!athlete || !activity) {
                res.status(400).send({response: RESPONSES.SUCCESS});
                return;
            }
            try {
                const updatedActivity = await this.boostActivity(activity, athlete);
                res.status(200).send({activity: updatedActivity});
            } catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });

        app.post(`${CONST.API_PREFIX}/delete-activity`, async (req, res) => {
            await this.deleteActivity(req.body.activityId)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });

        app.post(`${CONST.API_PREFIX}/approve-activity`, async (req, res) => {
          const activity = await this.getActivity(req.body.activityId);
          const athlete = await this.athleteService.getAthlete(activity.athlete.id.toString());
          if(!athlete || !activity) {
              res.status(400).send({response: RESPONSES.SUCCESS});
              return;
          }
          await this.approveActivity(activity)
          res.status(200).send({response: RESPONSES.ERROR.INVALID_ATHLETE});
        });

        app.post(`${CONST.API_PREFIX}/activities`, async (req, res) => {
            const token = res.get('accessToken');
            if(!token) {
                return;
            }
            this.getAthleteActivities(token).then(async activities => {
                const requestedIds = req.body.activityIds;
                const commandId = req.body.commandId;
                const dateFrom = req.body.from;
                if(await this.fireStoreService.commandCollection.exists(commandId)) {
                    await this.fireStoreService.deleteCommand(commandId)
                } else {
                    return;
                }
                if(requestedIds?.length) {
                    activities = activities.filter((activity: any) => requestedIds.indexOf(activity.id) !== -1)
                }
                if(dateFrom) {
                    activities = activities.filter((activity: any) => (+ new Date(activity.start_date)) > dateFrom)
                }
                for (let i = 0; i < activities.length; i++) {
                    await Promise.all([
                        this.fireStoreService.deletePendingActivity(activities[i].id),
                        this.addDetailedActivity({ ...activities[i],
                            gameData: {
                                status: ActivityStatus.NEW
                            }
                        }),
                        this.challengeService.evaluateChallengeProgress(activities[i], activities[i].athlete.id.toString(), true)
                    ])
                }
                res.status(200).send(activities);
            }, (err) => {
                this.logger.error('Error trying to get detailed activities from Strava');
            })
        });

        app.post(`${CONST.API_PREFIX}/athlete/calculate-base-workout`,async (req, res) => {
            const token = res.get('accessToken');
            if(!token) {
                return;
            }
            await this.calculateBaseWorkout(token, req.body.athleteId)
            if(req.body.commandId) {
                await this.fireStoreService.deleteCommand(req.body.commandId)
            }
            res.status(200).send({});
        });
    }

    async getActivity(activityId: number | string): Promise<Activity> {
        const activity: Activity = await this.fireStoreService.detailedActivityCollection.get(activityId.toString());
        if(!activity) {
            this.logger.info(`Activity ${activityId} does not exist`);
            throw 'Activity does not exist';
        } else {
            return activity;
        }
    }

    async tryAutoApprove(activityId: number): Promise<void> {
        const activity = await this.getActivity(activityId);
        const cardSnapshots: CardSnapshot[] = activity.gameData.cardSnapshots;

        const athlete = await this.athleteService.getAthlete(activity.athlete.id);

        this.logger.info(`Attempting auto approve for activity ${activityId} for ${athlete.logName}`)

        if(StaticValidationService.validateCardGroup(activity, cardSnapshots, athlete.baseWorkout)) {
            this.logger.info(`All validators passed for ${activityId} for ${athlete.logName}`)
            await this.approveActivity(activity.id.toString());

            const completedBaseCardsBefore = this.getCompletedBaseCardCount(athlete.baseCardProgress);
            const completedBaseCardsAfter = this.getCompletedBaseCardCount(await this.updateBaseCard(athlete, activity, cardSnapshots));
            await this.challengeService.evaluateChallengeProgress(
                activity,
                athlete.id,
                false,
                Math.max(completedBaseCardsAfter - completedBaseCardsBefore, 0)
            );
        } else {
            this.logger.info(`Validator(s) failed, switching for manual approve ${activityId}`)
        }
    }

    async approveActivity(activityId: any) {
        const activity = await this.getActivity(activityId);
        const athlete = await this.athleteService.getAthlete(activity.athlete.id);

        if(activity.gameData.status === ActivityStatus.APPROVED) {
            this.logger.error(`Activity ${activity.id} was already approved for athlete ${athlete.logName}`)
            return;
        }

        await this.fireStoreService.detailedActivityCollection.update(
            activity.id.toString(),
            {
            gameData: {
                ...activity.gameData,
                status: ActivityStatus.APPROVED,
            }
        })

        this.logger.info(`Activity ${activity.id} was approved for athlete ${athlete.logName} with cards ${activity.gameData.cardSnapshots.map((card: CardSnapshot) => card.title)}`)
    }

    async updateBaseCard(athlete: Athlete, activity: Activity, cardSnapshots: CardSnapshot[]): Promise<BaseCardProgress> {
        const baseWorkout = athlete.baseWorkout;
        const remainderActivity = StaticValidationService.getActivityRemainder(activity, cardSnapshots, baseWorkout);
        const updatedBaseCardProgress = StaticValidationService.updateBaseCardProgress(remainderActivity, baseWorkout, athlete.baseCardProgress);
        await this.fireStoreService.athleteCollection.update(
            athlete.id,
            {
                baseCardProgress: updatedBaseCardProgress
            }
        )
        return updatedBaseCardProgress;
    }

    async updatePersonalBests(activity: Activity, cardIds: string[]) {
        if(cardIds.length) {
            const cards = await this.fireStoreService.cardCollection.whereQuery([{ fieldPath: 'id', opStr: 'in', value: cardIds}])
            const baseWorkoutPatch: any = {};
            const normalizedType = StaticValidationService.normalizeActivityType(activity);
            baseWorkoutPatch[normalizedType] = {};
            cards.forEach((card) => {
                card.validators.forEach((validator: any) => {
                    RULES.UPDATABLE_PROPERTIES.forEach((property: any) => {
                        if(validator.formula.indexOf(property) !== -1) {
                            // @ts-ignore
                            baseWorkoutPatch[normalizedType][property] = (activity[validator.property] - RULES.UPDATABLE_PROPERTIES_DELTA[property])
                        }
                    })
                })
            })

            if(Object.keys(baseWorkoutPatch[normalizedType]).length) {
                const athlete = await this.athleteService.getAthlete(activity.athlete.id.toString());
                this.athleteService.updateBaseWorkout(athlete, baseWorkoutPatch);
                await this.athleteService.updateAthlete(athlete);
            }
        }
    }

    async submitAllActivities(athleteId: string) {
        const activities = await this.fireStoreService.detailedActivityCollection.whereQuery([
            {fieldPath: 'athlete.id', opStr: '==', value: parseInt(athleteId, 10)},
            {fieldPath: 'gameData.status', opStr: '==', value: ActivityStatus.NEW},
        ]);
        for(let i = 0; i < activities.length; i++) {
            try {
                await this.submitActivity(activities[i].id, [], [], []);
                await this.tryAutoApprove(activities[i].id);
            } catch (err) {
                this.logger.info(`Error auto submitting activity ${activities[i].id} for athlete ${athleteId}`);
            }
        }
    }

    async submitActivity(activityId: number, cardIds: string[], images: UploadedImage[][], comments: string[]) {
        const activity = await this.getActivity(activityId);
        const athlete = await this.athleteService.getAthlete(activity.athlete.id);

        // Activation requirement disabled
        // if(cardIds.find(id => (athlete.cards.active.indexOf(id) === -1) && id !== featuredCard)) {
        //     this.logger.info(`Athlete ${athlete.name} ${athlete.id} tried to submit unactivated card(s) ${cardIds}`)
        //     throw RESPONSES.ERROR.CARD_NOT_ACTIVATED
        // }

        if(activity.gameData.status !== ActivityStatus.NEW
            && activity.gameData.status !== ActivityStatus.REJECTED) {
            this.logger.info(`Athlete ${athlete.logName} submitted activity ${activityId} with invalid status ${activity.gameData.status}`)
            throw RESPONSES.ERROR.WRONG_ACTIVITY_STATUS
        }

        if(cardIds.length > RULES.MAX_CARDS_SUBMIT) {
            this.logger.info(`Athlete ${athlete.logName} submitted activity with too many cards ${cardIds}`)
            throw RESPONSES.ERROR.MAX_CARDS_SUBMIT
        }

        const cards: Card[] = cardIds.length ? CARDS.filter((card => cardIds.indexOf(card.id) !== -1)) : [];

        if(cardIds.length > RULES.MAX_CARDS_SUBMIT) {
            this.logger.info(`Athlete ${athlete.logName} submitted activity with too many cards ${cardIds}`)
            throw RESPONSES.ERROR.MAX_CARDS_SUBMIT
        }

        const cardSnapshots: CardSnapshot[] = cardIds.map((id, index) => {
            return CardSnapshot.fromJSONObject(
                {
                    ...(cards.find(card => card.id === id) || Card.empty()),
                    comment: comments[index] || '',
                    likes: [],
                    reports: [],
                    attachedImages: images[index] || []
                }
            )
        })

        athlete.cards.active = athlete.cards.active.filter(cardId => cardIds.indexOf(cardId) === -1);
        athlete.cards.completed = [...athlete.cards.completed, ...cardIds];
        this.athleteService.spendEnergy(athlete, StaticValidationService.requiredEnergy(cards));

        await Promise.all([
            this.athleteService.updateAthlete(athlete),
            this.fireStoreService.detailedActivityCollection.update(
                activityId.toString(),
                {
                    gameData: {
                        status: ActivityStatus.SUBMITTED,
                        submittedAt: new Date().toISOString(),
                        cardIds,
                        cardSnapshots: cardSnapshots.map((snapshot: CardSnapshot) => snapshot.toJSONObject()), // Storing card snapshots
                        comments: comments?.join(' / ') || '',
                    }
                })
        ])

        this.logger.info(`Athlete ${athlete.logName} submitted activity with ${cardIds}`)
    }

    async rejectActivity(activityId: string, comments: string) {
        const activity = await this.fireStoreService.detailedActivityCollection.get(activityId.toString())
        await this.fireStoreService.detailedActivityCollection.update(
            activityId.toString(),
            {
                gameData: {
                    ...activity.gameData,
                    cardSnapshots: [],
                    cardIds: [],
                    images: [],
                    comments,
                    status: ActivityStatus.NEW,
                }
            })
        this.logger.info(`Activity ${activity.type} ${activityId} was rejected for athlete ${activity.athlete.id.toString()}`)
    }

    async boostActivity(activity: Activity, athlete: Athlete): Promise<Activity> {
        athlete.spendCoins(RULES.COINS.ACTIVITY_BOOST_PRICE);

        const activityType = StaticValidationService.normalizeActivityType(activity);
        const targetStat = StaticValidationService.baseActivityTypeMap.get(activityType);
        if(!targetStat) {
            this.logger.info(`Activity ${activity.id} has no target stat`)
            throw 'Activity has no target stat';
        }

        const activityPatch = {};
        // @ts-ignore
        activityPatch[targetStat] = activity[targetStat] + (RULES.DEFAULT_BASE_WORKOUT[activityType][targetStat] * 0.1);

        forkJoin([
           this.athleteService.updateAthlete(athlete),
              this.fireStoreService.detailedActivityCollection.update(
                activity.id.toString(),
                activityPatch
              )
        ]);

        this.logger.info(`Activity ${activity.id} ${activityType} ${targetStat} was boosted for athlete ${athlete.logName} for ${RULES.COINS.ACTIVITY_BOOST_PRICE} coins`)
        return {
            ...activity,
            ...activityPatch
        }
    }

    async addDetailedActivity(activity: any) {
        if (await this.fireStoreService.detailedActivityCollection.exists(activity.id.toString())) {
            // this.logger.error(`Activity ${activity.id} already exists`); Too much spam
        } else {
            this.logger.info(`Activity ${activity.id} added for athlete ${activity.athlete.id}`);
            return await this.fireStoreService.detailedActivityCollection.set(activity.id.toString(), activity)
        }
    }

    async deleteActivity(activityId: string) {
        const activity = await this.fireStoreService.detailedActivityCollection.get(activityId.toString())
        await this.fireStoreService.detailedActivityCollection.update(
            activityId.toString(),
            {
                gameData: {
                    ...activity.gameData,
                    cardSnapshots: [],
                    cardIds: [],
                    status: ActivityStatus.DELETED,
                }
            })
        this.logger.info(`Activity ${activityId} was deleted for athlete ${activity.athlete.id.toString()}`)
    }

    async getAthleteActivities(accessToken: string): Promise<any[]> {
        const response = await axios.get(`${CONST.STRAVA_BASE}/api/v3/activities`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response?.data || [];
    }

    getCompletedBaseCardCount(baseCardProgress: BaseCardProgress): number {
        return Object.values(baseCardProgress || {}).reduce((acc: number, value: number) => acc + Math.floor((value || 0) / RULES.PROGRESS_PRECISION), 0);
    }


    async calculateBaseWorkout(accessToken: string, athleteId: string) {
        const athlete = await this.athleteService.getAthlete(athleteId);
        const activities = await this.getAthleteActivities(accessToken);

        const baseWorkoutPatch: any = {};
        const properties = [
            CONST.ACTIVITY_PROPERTIES.AVERAGE_SPEED
        ]
        const types = [
            CONST.ACTIVITY_TYPES.RUN,
            CONST.ACTIVITY_TYPES.RIDE,
        ]

        types.forEach(type => {
            const typedActivities = activities
                .filter((activity: any) => activity.type.toUpperCase().indexOf(type.toUpperCase()) !== -1)

            const total = typedActivities.reduce((acc: any, activity: any) => {
                properties.forEach(prop => {
                    if(!acc[prop]) {
                        acc[prop] = []
                    }
                    acc[prop].push(activity[prop])
                })
                return acc
            }, {})


            properties.forEach(prop => {
                let values = total[prop];
                if(!baseWorkoutPatch[type]) {
                    baseWorkoutPatch[type] = {}
                }
                if(values && values.length >= 4) {
                    values = values.sort((a: number, b: number) => a - b);
                    while (values.length > 4) {
                        values.length % 2 ? values.pop() : values.shift()
                    }
                    const sum = values.reduce((acc: any, item: any) => acc + item, 0)
                    baseWorkoutPatch[type][prop] = (sum/values.length);
                    // @ts-ignore
                    baseWorkoutPatch[type][prop] = baseWorkoutPatch[type][prop] - baseWorkoutPatch[type][prop] % RULES.ESTIMATION_ACCURACY[prop];
                } else {
                    // @ts-ignore
                    baseWorkoutPatch[type][prop] = RULES.DEFAULT_BASE_WORKOUT[type][prop]
                }
            })
        })

        this.athleteService.updateBaseWorkout(athlete, baseWorkoutPatch)
        await this.athleteService.updateAthlete(athlete);
    }
}
