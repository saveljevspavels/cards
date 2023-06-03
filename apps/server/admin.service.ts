import {Express} from "express";
import {FirestoreService} from "./firestore.service";
import {CONST} from "../../definitions/constants";
import {RESPONSES} from "./response-codes";
import {CardScheme} from "../shared/interfaces/card-scheme.interface";
import {Logger} from "winston";

export default class AdminService {
    constructor(
        private app: Express,
        private fireStoreService: FirestoreService,
        private logger: Logger
    ) {

        app.post(`${CONST.API_PREFIX}/admin/commands`, (req, res) => {
            const athleteIds = req?.body?.athleteIds
            if(athleteIds) {
                athleteIds.forEach(((id: string) => {
                    fireStoreService.addCommand(id, {
                        ...req?.body?.command
                    });
                }))
            }
            res.status(200).send({});
        });

        app.post(`${CONST.API_PREFIX}/admin/save-schema`, async (req, res) => {
            await this.saveSchema(req.body)
            res.status(200).send({response: RESPONSES.SUCCESS});
        });
    }

    async saveSchema(scheme: CardScheme, id: string = CONST.SCHEME_ID) {
        const schemeDoc = this.fireStoreService.schemeCollection.doc(id);
        await schemeDoc.set(scheme);
        this.logger.info(`Scheme ${id} saved`)
    }
}
