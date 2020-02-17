const requestPromise = require('request-promise');
const $ = require('cheerio');
const fs = require('fs');
const request = require('request');


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


/**
 * Whole process getting data from market data api
 * @param sequelizeObjects
 * @return {Promise<any>}
 * @constructor
 */
exports.GetLatestData = function (sequelizeObjects) {
  return new Promise(function (resolve, reject) {
    const url = 'https://www.op.fi/henkiloasiakkaat/saastot-ja-sijoitukset/rahastot/kaikki-rahastot/op-aasia-indeksi/';
    GetApiKey(url).then(apiKey => {
      console.log(apiKey);
      GetMarketData(apiKey, ['52545233', '52470546', '52545231', '52470536', '199092937'])
    }).catch(error => {
      console.log(error);
    })
  });
};


/**
 * Get api key
 * @return {Promise<any>}
 * @constructor
 */
function GetApiKey(url) {
  return new Promise(function (resolve, reject) {
    let keyData = {
      'timestamp': null,
      'challenge': null
    };
    requestPromise(url).then(function (html) {
      const lines = String(html).split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.indexOf('authToken = "&timestamp=') !== -1) {
          const split = line.split('&');
          split.forEach(function (part) {
            if (part.includes('timestamp')) {
              keyData.timestamp = part.replace('timestamp=', '');
            }
            if (part.includes('challenge')) {
              keyData.challenge = part.replace('challenge=', '').replace('",', '');
            }
          });
        }
        resolve(keyData);
      }
    }).catch(error => {
      reject(error);
    });
  });
}


function GetMarketData(apiKey, idNotations = []) {
  // noinspection JSIgnoredPromiseFromCall
  asyncForEach(idNotations, async (idNotation) => {
    const options = {
      url: 'https://marketdata.op.fi/portal2/charts/fundchartdata.php?timestamp=' + apiKey.timestamp +
        '&pid=0&uid=588&challenge=' + apiKey.challenge + '&ID_NOTATION=' + idNotation + '&type=line',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    request(options, function (err, res, body) {
      if (!err) {

        console.log(JSON.stringify(JSON.parse(body)));

      } else {
        console.log(err);
      }
    });

  });
}
