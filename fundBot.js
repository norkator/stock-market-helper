'use strict';

// Components
const initDb = require('./module/database');
const schedule = require('node-schedule');
const dotEnv = require('dotenv');
dotEnv.config();
const marketData = require('./app/marketdata');


// Run app
initDb.initDatabase().then(() => {
  let sequelizeObjects = require('./module/sequelize');


  marketData.GetLatestData(sequelizeObjects);

  // Register scheduled tasks
  schedule.scheduleJob('* * 6 * * *', () => { // Every 6 hours
    // TODO: Get data and process it
  });

});
