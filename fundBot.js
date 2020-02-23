'use strict';

// Components
const initDb = require('./module/database');
const schedule = require('node-schedule');
const dotEnv = require('dotenv');
dotEnv.config();
const marketData = require('./app/marketdata');
const logger = require('./module/logger');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const path = require('path');


// Run app
initDb.initDatabase().then(() => {
  let sequelizeObjects = require('./module/sequelize');


  // Register scheduled tasks
  schedule.scheduleJob('* * 12 * * *', () => {
    marketData.GetLatestData(sequelizeObjects).then(() => {
    });
  });


  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true,}));

  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });

  app.use(function (req, res, next) {
    logger.log(req.method + req.url, logger.LOG_UNDERSCORE);
    next();
  });

  app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname + '/html/index.html'));
  });

  // -------------------------------------------------------------------------------------------------------------------
  // Register routes

  require('./routes/funds').Funds(app, sequelizeObjects);

  // -------------------------------------------------------------------------------------------------------------------
  // Start web server

  // Development server
  app.listen(process.env.API_PORT, () => {
    logger.log(`Development api listening on port ${process.env.API_PORT}.`, logger.LOG_YELLOW);
  });

  // -------------------------------------------------------------------------------------------------------------------

});
