import CONST from "../../definitions/constants.json";

export default class AdminService {
    constructor(app, fireStoreService) {

        app.post(`${CONST.API_PREFIX}admin/commands`, (req, res) => {
            const athleteIds = req?.body?.athleteIds
            if(athleteIds) {
                athleteIds.forEach((id => {
                    fireStoreService.addCommand(id, {
                        ...req?.body?.command
                    });
                }))
            }
            res.status(200).send({});
        });

    }
}
