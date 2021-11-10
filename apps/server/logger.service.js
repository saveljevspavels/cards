import fs from "fs";
import winston from "winston";
import CONST from "../../definitions/constants.json";
import {type} from "os";

export default class LoggerService {
    constructor(app) {

        app.get(`${CONST.API_PREFIX}admin/logs`, (req, res) => {
            try {
                let data = fs.readFileSync('log.log', 'utf8')
                data = JSON.parse('[' + data.trim().slice(0, -1) + ']');
                res.status(200).send(data);
            } catch (err) {
                res.status(500).send(err);
            }
        });

        return winston.createLogger({
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                winston.format.printf((info) =>
                    JSON.stringify({
                        t: info.timestamp,
                        l: info.level,
                        m: info.message,
                        s: info.splat !== undefined ? `${info.splat}` : '',
                    }) + ','
                )
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'log.log', timestamp: true })
            ]
        });
    }
}