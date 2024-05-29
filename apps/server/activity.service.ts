import {RESPONSES} from "./response-codes";
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import {RULES} from "../../definitions/rules";
import {Logger} from "winston";
import {StaticValidationService} from "../shared/services/validation.service";
import Card, {CardSnapshot, NullCard} from "../shared/interfaces/card.interface";
import Athlete from "../shared/classes/athlete.class";
import AthleteService from "./athlete.service";
import {ConstService} from "../cards/src/app/services/const.service";
import {UploadedImage} from "../shared/interfaces/image-upload.interface";
import {ChallengeService} from "./challenge.service";
import {Activity, ActivityStatus} from "../shared/interfaces/activity.interface";

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
                // await this.tryAutoApprove(req.body.activityId) // TODO: uncomment before commit
            } catch (err) {
                console.log(err);
                res.status(500).send(err);
            }
            res.status(200).send();
        });

        app.post(`${CONST.API_PREFIX}/reject-activity`, async (req, res) => {
            await this.rejectActivity(req.body.activityId, req.body.comments)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });

        app.post(`${CONST.API_PREFIX}/delete-activity`, async (req, res) => {
            await this.deleteActivity(req.body.activityId)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });

        app.post(`${CONST.API_PREFIX}/approve-activity`, async (req, res) => {
          const activity = await this.getActivity(req.body.activityId);
          const athlete = await this.fireStoreService.athleteCollection.get(activity.athlete.id.toString());
          if(!athlete || !activity) {
              res.status(400).send({response: RESPONSES.SUCCESS});
              return;
          }
          await this.approveActivity(activity)
          res.status(200).send({response: RESPONSES.ERROR.INVALID_ATHLETE});
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
        this.logger.info(`Attempting auto approve for activity ${activityId}`)
        const activity = await this.getActivity(activityId);

        const cardSnapshots: CardSnapshot[] = activity.gameData.cardSnapshots;

        const athlete = await this.athleteService.getAthlete(activity.athlete.id);

        if(StaticValidationService.validateCardGroup(activity, cardSnapshots, athlete.baseWorkout)) {
            this.logger.info(`All validators passed for ${activityId}`)
            await this.approveActivity(activity.id.toString());
            await this.updateBaseCard(athlete, activity, cardSnapshots);
        } else {
            this.logger.info(`Validator(s) failed, switching for manual approve ${activityId}`)
        }
    }

    async approveActivity(activityId: any) {
        const activity = await this.getActivity(activityId);
        const athlete = await this.athleteService.getAthlete(activity.athlete.id);

        if(activity.gameData.status === ActivityStatus.APPROVED) {
            this.logger.error(`Activity ${activity.id} was already approved for athlete ${activity.athlete.id.toString()}`)
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

        this.logger.info(`Activity ${activity.id} was approved for athlete ${athlete.firstname} ${athlete.lastname} with cards ${activity.gameData.cardSnapshots.map((card: CardSnapshot) => card.title)}`)
    }

    async updateBaseCard(athlete: Athlete, activity: Activity, cardSnapshots: CardSnapshot[]) {
        const baseWorkout = athlete.baseWorkout;
        const remainderActivity = StaticValidationService.getActivityRemainder(activity, cardSnapshots, baseWorkout);
        return await this.fireStoreService.athleteCollection.update(
            athlete.id,
            {
                baseCardProgress: StaticValidationService.updateBaseCardProgress(remainderActivity, baseWorkout, athlete.baseCardProgress)
            }
        )
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
                await this.submitActivity(activities[i].id, [], [], '');
                await this.tryAutoApprove(activities[i].id);
            } catch (err) {
                this.logger.info(`Error auto submitting activity ${activities[i].id} for athlete ${athleteId}`);
            }
        }
    }

    async submitActivity(activityId: number, cardIds: string[], images: UploadedImage[][], comments: string) {
        const activity = await this.getActivity(activityId);
        const athlete = await this.athleteService.getAthlete(activity.athlete.id);
        const featuredCard = (await this.fireStoreService.gameCollection.get(CONST.GAME_ID))?.featuredCard;

        if(cardIds.find(id => (athlete.cards.active.indexOf(id) === -1) && id !== featuredCard)) {
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} tried to submit unactivated card(s) ${cardIds}`)
            throw RESPONSES.ERROR.CARD_NOT_ACTIVATED
        }

        if(activity.gameData.status !== ActivityStatus.NEW
            && activity.gameData.status !== ActivityStatus.REJECTED) {
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} submitted activity ${activityId} with invalid status ${activity.gameData.status}`)
            throw RESPONSES.ERROR.WRONG_ACTIVITY_STATUS
        }

        if(cardIds.length > RULES.MAX_CARDS_SUBMIT) {
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} submitted activity with too many cards ${cardIds}`)
            throw RESPONSES.ERROR.MAX_CARDS_SUBMIT
        }

        const cards: Card[] = cardIds.length ? await this.fireStoreService.cardCollection.whereQuery([{fieldPath: 'id', opStr: 'in', value: cardIds}]) : [];

        if(cardIds.length > RULES.MAX_CARDS_SUBMIT) {
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} submitted activity with too many cards ${cardIds}`)
            throw RESPONSES.ERROR.MAX_CARDS_SUBMIT
        }

        const cardSnapshots: CardSnapshot[] = cardIds.map((id, index) => {
            return {
                ...(cards.find(card => card.id === id) || NullCard),
                likes: [],
                reports: [],
                attachedImages: images[index] || []
            }
        })

        await this.challengeService.evaluateChallengeProgress(activity, athlete);

        // TODO: uncomment before commit
        // await Promise.all([
        //     this.fireStoreService.athleteCollection.update(
        //         athlete.id,
        //         {
        //             cards: {
        //                 ...athlete.cards,
        //                 active: athlete.cards.active.filter(cardId => cardIds.indexOf(cardId) === -1),
        //                 completed: [...athlete.cards.completed, ...cardIds]
        //             }
        //         }
        //
        //     ),
        //     this.fireStoreService.detailedActivityCollection.update(
        //         activityId.toString(),
        //         {
        //             gameData: {
        //                 status: ActivityStatus.SUBMITTED,
        //                 submittedAt: new Date().toISOString(),
        //                 cardIds,
        //                 cardSnapshots, // Storing card snapshots
        //                 comments
        //             }
        //         })
        // ])

        this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} submitted activity with ${cardIds}`)
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
}
