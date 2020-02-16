'use strict';

// Components
const initDb = require('./module/database');
const schedule = require('node-schedule');
const dotEnv = require('dotenv');
dotEnv.config();


// Run app
initDb.initDatabase().then(() => {
  let sequelizeObjects = require('./module/sequelize');

  // Register scheduled tasks
  schedule.scheduleJob('* * 6 * * *', () => { // Every 6 hours
    // TODO: Get data and process it
  });

});
