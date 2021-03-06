import CONST from "../../definitions/constants.json";

export default class WebhookService {
    constructor(app, fireStoreService) {
        // Sets server port and logs message on success
        app.listen(process.env.PORT || 3000, () => console.log('webhook is listening'));

        // Creates the endpoint for our webhook
        app.post(`${CONST.API_PREFIX}webhook`, (req, res) => {
            switch(req.body.aspect_type) {
                case 'create': fireStoreService.addPendingActivity(req.body); break;
                case 'delete': fireStoreService.deletePendingActivity(req.body.object_id); break;
            }
            res.status(200).send('EVENT_RECEIVED');
        });

        // Adds support for GET requests to our webhook
        app.get(`${CONST.API_PREFIX}webhook`, (req, res) => {
            // Your verify token. Should be a random string.
            const VERIFY_TOKEN = "STRAVA";
            // Parses the query params
            let mode = req.query['hub.mode'];
            let token = req.query['hub.verify_token'];
            let challenge = req.query['hub.challenge'];
            // Checks if a token and mode is in the query string of the request
            if (mode && token) {
                // Verifies that the mode and token sent are valid
                if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                    // Responds with the challenge token from the request
                    console.log('WEBHOOK_VERIFIED');
                    res.json({"hub.challenge":challenge});
                } else {
                    // Responds with '403 Forbidden' if verify tokens do not match
                    res.sendStatus(403);
                }
            }
        });
    }
}

