const requestPromise = require('request-promise');
const $ = require('cheerio');
const fs = require('fs');
const request = require('request');
const moment = require('moment');


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
      GetMarketData(apiKey, ['52545233', '52470546', '52545231', '52470536', '199092937']).then(data => {
        InsertData(sequelizeObjects, data).then(() => {
          resolve();
        }).catch(() => {
          reject();
        });
      }).catch(() => {
        reject();
      });
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


/**
 * Get notations data
 * @param {String} apiKey
 * @param {Array} idNotations
 * @return {Promise<Array>}
 * @constructor
 */
function GetMarketData(apiKey, idNotations = []) {
  return new Promise(function (resolve, reject) {
    let count = 0;
    let fundData = [];
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
          fundData.push({
            notation: idNotations[count],
            data: JSON.parse(body)
          });
        } else {
          console.log(err);
        }
        count++;
        if (count === idNotations.length) {
          resolve(fundData);
        }
      });
    });
  });
}


function InsertData(sequelizeObjects, notationData_ = []) {
  return new Promise(function (resolve, reject) {
    // noinspection JSIgnoredPromiseFromCall
    asyncForEach(notationData_, async (notationData) => {
      sequelizeObjects.Data.findAll({
        limit: 1,
        attributes: [
          'data_date_time',
        ],
        where: {
          id_notation: notationData.notation,
        },
        order: [
          ['data_date_time', 'desc']
        ]
      }).then(rows => {
        let lastNotationDataDateTime = new moment('2020-01-01');
        if (rows.length > 0) {
          lastNotationDataDateTime = new moment(rows[0].data_date_time);
        }
        let bulkData = [];
        notationData.data.forEach(function (data) {
          const dataPartDateTime = new moment(data[0]);
          if (dataPartDateTime > lastNotationDataDateTime) {
            bulkData.push({
              id_notation: notationData.notation,
              data_date_time: dataPartDateTime,
              data_value: data[1]
            });
          }
        });
        BulkInsert(sequelizeObjects, bulkData);
      });
    });
  });
}


function BulkInsert(sequelizeObjects, bulkData = []) {
  sequelizeObjects.Data.bulkCreate(bulkData
  ).then(() => {
  })
}
