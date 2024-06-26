import {RULES} from "../../../definitions/rules";
import {CONST} from "../../../definitions/constants";

export const generateId = () => {
    return Math.random().toString(36).substring(2);
}

export const parseResponse = (response: any, reqBody: any, callback: any) => {
    response.setEncoding('utf8');

    let responseData = '';
    let headers = response.headers;

    response.on('data', function(chunk: any) {
        responseData += chunk;
    });

    response.on('end', function() {

        response.destroy();

        if (headers['content-type'] && headers['content-type'].indexOf('application/json') !== -1) {

            try {
                responseData = JSON.parse(responseData);
            } catch (error) {
                callback(reqBody, [])
            }
        }

        callback(reqBody, responseData)
    });
}

export const getRandomInt = (max: number) => {
    return Math.floor(Math.random() * max);
}

export const tierToRoman = (number: number): string => {
    switch (number) {
        case 0: return 'I';
        case 1: return 'II';
        case 2: return 'III';
        case 3: return 'IV';
        case 4: return 'V';
        default: return ''
    }
}

export const getTier = (value: number) => {
    if(value >= RULES.CARD_LEVELS["0"].min && value <= RULES.CARD_LEVELS["0"].max) return 0
    if(value >= RULES.CARD_LEVELS["1"].min && value <= RULES.CARD_LEVELS["1"].max) return 1
    if(value >= RULES.CARD_LEVELS["2"].min && value <= RULES.CARD_LEVELS["2"].max) return 2
    if(value >= RULES.CARD_LEVELS["3"].min && value <= RULES.CARD_LEVELS["3"].max) return 3
    if(value >= RULES.CARD_LEVELS["4"].min && value <= RULES.CARD_LEVELS["4"].max) return 4
    return 0;
}
