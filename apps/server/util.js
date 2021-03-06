import CONST from "../../definitions/constants.json";
import RULES from "../../definitions/rules.json";

export const generateId = () => {
    return Math.random().toString(36).substring(7);
}

export const parseResponse = (response, reqBody, callback) => {
    response.setEncoding('utf8');

    let responseData = '';
    let headers = response.headers;

    response.on('data', function(chunk) {
        responseData += chunk;
    });

    response.on('end', function() {

        response.destroy();

        if (headers['content-type'] && headers['content-type'].indexOf('application/json') !== -1) {

            try {
                responseData = JSON.parse(responseData);
            } catch (error) {
                res.status(500).send(error);
                callback(reqBody, [])
            }
        }

        callback(reqBody, responseData)
    });
}

export const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}

export const updateScoreValues = (score, earnedValues, reducedValues, cardAmount, achievementsAmount) => {
  return {
    value: score.value ? parseInt(score.value + earnedValues) : earnedValues,
    reduced: score.reduced ? parseInt(score.reduced + reducedValues) : reducedValues,
    cardsPlayed: score.cardsPlayed ? parseInt(score.cardsPlayed + cardAmount) : cardAmount,
    achievementsAmount: score.achievementsAmount ? parseInt(score.achievementsAmount + achievementsAmount) : achievementsAmount,
  }
}

export const normalizeActivityType = (type) => {
    return Object.values(CONST.ACTIVITY_TYPES).find((activityType) => type.toUpperCase().indexOf(activityType.toUpperCase()) !== -1) || CONST.ACTIVITY_TYPES.OTHER
}

export const tierToRoman = (number) => {
    switch (parseInt(number)) {
        case 0: return 'I';
        case 1: return 'II';
        case 2: return 'III';
        case 3: return 'IV';
        case 4: return 'V';
    }
}

export const getTier = (value) => {
    if(value >= RULES.LEVELS["0"].min && value <= RULES.LEVELS["0"].max) return 0
    if(value >= RULES.LEVELS["1"].min && value <= RULES.LEVELS["1"].max) return 1
    if(value >= RULES.LEVELS["2"].min && value <= RULES.LEVELS["2"].max) return 2
    if(value >= RULES.LEVELS["3"].min && value <= RULES.LEVELS["3"].max) return 3
    if(value >= RULES.LEVELS["4"].min && value <= RULES.LEVELS["4"].max) return 4
    return 0;
}

export const getEnergyAdjustedValue = (value, energy) => {
    return Math.ceil(parseInt(value) * (1 - (RULES.ENERGY.REDUCTION_STEP * (RULES.ENERGY.MAX - energy))))
}
