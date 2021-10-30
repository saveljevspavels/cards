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
                console.error('Error parsing response', error)
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

export const updateScoreValues = (score, values, cardAmount) => {
  const finalValue = values;
  return {
    value: score.value ? parseInt(score.value + finalValue) : finalValue,
    activities: score.activities ? parseInt(score.activities + 1) : 1,
    cardsPlayed: score.cardsPlayed ? parseInt(score.cardsPlayed + cardAmount) : cardAmount
  }
}
