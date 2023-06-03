import fs from "fs";
import winston from "winston";
import {Express} from "express";
import {CONST} from "../../definitions/constants";

export default class LoggerService {

    static init(app: Express) {
        app.get(`${CONST.API_PREFIX}/admin/logs`, (req, res) => {
            try {
                let data = fs.readFileSync('log.log', 'utf8')
                data = JSON.parse('[' + data.trim().slice(0, -1) + ']');
                res.status(200).send(data);
            } catch (err) {
                res.status(500).send(err);
            }
        });

        const transports = [
            // @ts-ignore
            new winston.transports.File({ filename: 'log.log', timestamp: true })
        ]
        if(process.env.NODE_ENV !== 'prod') {
            // @ts-ignore
            transports.push(new winston.transports.Console())
        }

        return winston.createLogger({
            format: winston.format.combine(
                winston.format.printf((info) =>
                    JSON.stringify({
                        t: new Date().toISOString(),
                        l: info.level,
                        m: info.message,
                        s: info.splat !== undefined ? `${info.splat}` : '',
                    }) + ','
                )
            ),
            transports
        });
    }
}
