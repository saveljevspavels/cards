import {RESPONSES} from "./response-codes";
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import {normalizeActivityType} from "./helpers/util";
import {RULES} from "../../definitions/rules";
import {Logger} from "winston";
import {StaticValidationService} from "../shared/services/validation.service";
import Card, {CardSnapshot, NullCard} from "../shared/interfaces/card.interface";
import Athlete from "../shared/interfaces/athlete.interface";

export default class ActivityService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger
    ) {
        app.post(`${CONST.API_PREFIX}/submit-activity`, async (req, res) => {
            let response = await this.submitActivity(
                req.body.activityId,
                req.body.cardIds,
                req.body.images,
                req.body.comments
            )
            if(response === RESPONSES.SUCCESS) {
                response = await this.tryAutoApprove(req.body.activityId)
            }
            res.status(response === RESPONSES.SUCCESS ? 200 : 400).send({response: response});
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

    async getActivity(activityId: number) {
        return await this.fireStoreService.detailedActivityCollection.get(activityId.toString());
    }

    async tryAutoApprove(activityId: number) {
        this.logger.info(`Attempting auto approve for activity ${activityId}`)
        const activity = await this.getActivity(activityId);

        const cardSnapshots: CardSnapshot[] = activity.gameData.cardSnapshots;

        const athlete = await this.fireStoreService.athleteCollection.get(activity.athlete.id.toString());
        if(!athlete) {
            return;
        }

        if(StaticValidationService.validateCardGroup(activity, cardSnapshots, athlete.baseWorkout)) {
            this.logger.info(`All validators passed for ${activityId}`)
            await this.approveActivity(activity.id.toString());
            await this.updateBaseCard(athlete, activity, cardSnapshots);
        } else {
            this.logger.info(`Validator(s) failed, switching for manual approve ${activityId}`)
        }

        return RESPONSES.SUCCESS;
    }

    async approveActivity(activityId: any) {
        const activity = await this.fireStoreService.detailedActivityCollection.get(activityId);
        const athlete = await this.fireStoreService.athleteCollection.get(activity.athlete.id.toString());
        if(!athlete || !activity) {
            return;
        }

        if(activity.gameData.status === CONST.ACTIVITY_STATUSES.APPROVED) {
            this.logger.error(`Activity ${activity.id} was already approved for athlete ${activity.athlete.id.toString()}`)
            return;
        }

        await this.fireStoreService.detailedActivityCollection.update(
            activity.id.toString(),
            {
            gameData: {
                ...activity.gameData,
                status: CONST.ACTIVITY_STATUSES.APPROVED,
            }
        })

        this.logger.info(`Activity ${activity.id} was approved for athlete ${athlete.firstname} ${athlete.lastname} with cards ${activity.gameData.cardSnapshots.map((card: CardSnapshot) => card.title)}`)
    }

    async updateBaseCard(athlete: Athlete, activity: any, cardSnapshots: CardSnapshot[]) {
        const baseWorkout = athlete.baseWorkout;
        const remainderActivity = StaticValidationService.getActivityRemainder(activity, cardSnapshots, baseWorkout);
        return await this.fireStoreService.athleteCollection.update(
            athlete.id,
            {
                baseCardProgress: StaticValidationService.updateBaseCardProgress(remainderActivity, baseWorkout, athlete.baseCardProgress)
            }
        )
    }

    async updatePersonalBests(activity: any, cardIds: string[]) {
        if(cardIds.length) {
            const cards = await this.fireStoreService.cardCollection.where([{ fieldPath: 'id', opStr: 'in', value: cardIds}])
            const baseWorkoutPatch: any = {};
            const normalizedType = normalizeActivityType(activity.type);
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
                await this.fireStoreService.updateBaseWorkout([activity.athlete.id.toString()], baseWorkoutPatch)
            }
        }
    }

    async submitActivity(activityId: number, cardIds: string[], imageIds: string[][], comments: string) {
        const activity = await this.getActivity(activityId);
        const athlete = await this.fireStoreService.athleteCollection.get(activity.athlete.id.toString());

        if(!athlete || !activity) {
            return;
        }

        if(cardIds.find(id => athlete.activeCards.map(card => card.id).indexOf(id) === -1)) {
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} tried to submit unactivated card(s) ${cardIds}`)
            return RESPONSES.ERROR.CARD_NOT_ACTIVATED
        }

        if(activity.gameData.status !== CONST.ACTIVITY_STATUSES.NEW
            && activity.gameData.status !== CONST.ACTIVITY_STATUSES.REJECTED) {
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} submitted activity ${activityId} with invalid status ${activity.gameData.status}`)
            return RESPONSES.ERROR.WRONG_ACTIVITY_STATUS
        }

        if(cardIds.length > RULES.MAX_CARDS_SUBMIT) {
            this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} submitted activity with too many cards ${cardIds}`)
            return RESPONSES.ERROR.MAX_CARDS_SUBMIT
        }

        const cards: Card[] = cardIds.length ? await this.fireStoreService.cardCollection.where([{fieldPath: 'id', opStr: 'in', value: cardIds}]) : [];
        const cardSnapshots: CardSnapshot[] = cardIds.map((id, index) => {
            return {
                ...(cards.find(card => card.id === id) || NullCard),
                comment: comments[index] || '',
                attachedImages: imageIds[index] || []
            }
        });

        await this.fireStoreService.detailedActivityCollection.update(
            activityId.toString(),
            {
                gameData: {
                    status: CONST.ACTIVITY_STATUSES.SUBMITTED,
                    submittedAt: new Date().toISOString(),
                    cardIds,
                    cardSnapshots, // Storing card snapshots
                    images: imageIds,
                    comments
                }
            })
        this.logger.info(`Athlete ${athlete.firstname} ${athlete.lastname} ${athlete.id} submitted activity with ${cardIds}`)
        return RESPONSES.SUCCESS
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
                    status: CONST.ACTIVITY_STATUSES.NEW,
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
                    status: CONST.ACTIVITY_STATUSES.DELETED,
                }
            })
        this.logger.info(`Activity ${activityId} was deleted for athlete ${activity.athlete.id.toString()}`)
    }
}
