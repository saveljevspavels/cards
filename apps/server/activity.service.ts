import {RESPONSES} from "./response-codes";
import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import {ValidationService} from "./shared/validation.service";
import {normalizeActivityType} from "./helpers/util";
import {RULES} from "../../definitions/rules";
import {Logger} from "winston";
import CardService from "./card.service";

export default class ActivityService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger,
        private cardService: CardService
    ) {
        app.post(`${CONST.API_PREFIX}submit-activity`, async (req, res) => {
            let response = await fireStoreService.submitActivity(
                req.body.activityId,
                req.body.cards,
                req.body.images,
                req.body.comments
            )
            if(response === RESPONSES.SUCCESS) {
                response = await this.tryAutoApprove(req.body.activityId)
            }
            res.status(response === RESPONSES.SUCCESS ? 200 : 400).send({response: response});
        });

        app.post(`${CONST.API_PREFIX}reject-activity`, async (req, res) => {
            await fireStoreService.rejectActivity(req.body.activityId, req.body.comments)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });

        app.post(`${CONST.API_PREFIX}delete-activity`, async (req, res) => {
            await fireStoreService.deleteActivity(req.body.activityId)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });

        app.post(`${CONST.API_PREFIX}approve-activity`, async (req, res) => {
          await this.approveActivity(req.body.activityId, req.body.cardIds)
          res.status(200).send({response: RESPONSES.SUCCESS});
        });
    }

    async tryAutoApprove(activityId: string) {
        this.logger.info(`Attempting auto approve for activity ${activityId}`)
        const activityDoc = this.fireStoreService.detailedActivityCollection.doc(activityId.toString())
        const activity = (await activityDoc.get()).data() || {}
        if(!activity.gameData.cardSnapshots[0]) {
            this.logger.info(`No cards provided on activity ${activityId}, switching to manual validation`)
        } else {
            const card = activity.gameData.cardSnapshots[0]

            if(activity.gameData.cardSnapshots.find((card: any) => card.manualValidation)) {
                this.logger.info(`Manual validation required for card ${card.id}`)
                return RESPONSES.SUCCESS;
            }

            const athleteDoc = this.fireStoreService.athleteCollection.doc(activity.athlete.id.toString())
            const athlete = (await athleteDoc.get()).data() || {}

            if(activity.gameData.cardSnapshots
                .reduce((acc: any, card: any) => [...acc, ...card.validators], [])
                .reduce((acc: any, validator: any) => acc && ValidationService.validateRule(activity, validator, athlete.baseWorkout), true)
            ) { // Checks all validators
                this.logger.info(`All validators passed for ${activityId}`)
                await this.approveActivity(activityId, [card.id])
            } else {
                this.logger.info(`Validator(s) failed, switching for manual approve ${activityId}`)
            }
        }
        return RESPONSES.SUCCESS;
    }

    async approveActivity(activityId: string, cardIds: string[] = []) {
        const activityDoc = this.fireStoreService.detailedActivityCollection.doc(activityId.toString())
        const activity = (await activityDoc.get()).data() || {}
        if(activity.gameData.status === CONST.ACTIVITY_STATUSES.APPROVED) {
            this.logger.error(`Activity ${activityId} was already approved for athlete ${activity.athlete.id.toString()}`)
            return;
        }

        await activityDoc.set({
            ...activity,
            gameData: {
                ...activity.gameData,
                status: CONST.ACTIVITY_STATUSES.APPROVED,
                cardIds,
                cardSnapshots: activity.gameData.cardSnapshots.filter((snapshot: any) => cardIds.indexOf(snapshot.id) !== -1)
            }
        })

        const athleteDoc = this.fireStoreService.athleteCollection.doc(activity.athlete.id.toString())
        const athlete = (await athleteDoc.get()).data() || {}

        this.logger.info(`Activity ${activityId} was approved for athlete ${athlete.firstname} ${athlete.lastname} with cards ${cardIds}`)

        await this.fireStoreService.updateScore(activity.athlete.id.toString(), cardIds, []);
        await this.fireStoreService.spendEnergy(activity.athlete.id.toString(), cardIds);
        await this.cardService.updateCardUses(cardIds);
        await Promise.all([
            this.updatePersonalBests(activity, cardIds),
            this.fireStoreService.updateQueueUses(cardIds.length)
        ])
    }

    async updatePersonalBests(activity: any, cardIds: string[]) {
        if(cardIds.length) {
            const cardQuery = this.fireStoreService.cardCollection.where('id', 'in', cardIds)
            const cardDocs = await cardQuery.get()
            const baseWorkoutPatch: any = {};
            const normalizedType = normalizeActivityType(activity.type);
            baseWorkoutPatch[normalizedType] = {};
            cardDocs.forEach((card) => {
                card.data().validators.forEach((validator: any) => {
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
}
