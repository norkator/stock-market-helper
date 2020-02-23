const moment = require('moment');
const {Op} = require('sequelize');
const dotEnv = require('dotenv');
dotEnv.config();


function Funds(router, sequelizeObjects) {


  /**
   * Get funds chart
   */
  router.get('/get/funds/chart', function (req, res) {

    let fundsData = {'data': [], 'xkey': 'data_date_time', 'ykeys': [], 'labels': []};

    sequelizeObjects.Data.findAll({
      attributes: [
        'id_notation',
        'data_date_time',
        'data_value',
      ],
      order: [
        ['data_date_time', 'asc']
      ]
    }).then(rows => {
      if (rows.length > 0) {

        rows.forEach(row => {

          const rowDateTime = new moment(row.data_date_time).format('YYYY-MM-DD');

          const dateTimePosition = fundDataHasDateTime(rowDateTime);
          if (dateTimePosition >= 0) {

            fundsData.data[dateTimePosition][row.id_notation] = row.data_value;

            if (fundsData.labels.indexOf(String(row.id_notation)) === -1) {
              fundsData.labels.push(String(row.id_notation));
              fundsData.ykeys.push(String(row.id_notation));
            }

          } else {

            fundsData.data.push({
              'data_date_time': rowDateTime,
              [row.id_notation]: row.data_value
            });
            if (fundsData.labels.indexOf(String(row.id_notation)) === -1) {
              fundsData.labels.push(String(row.id_notation));
              fundsData.ykeys.push(String(row.id_notation));
            }

          }
        });


        function fundDataHasDateTime(data_date_time) {
          for (let i = 0; i < fundsData.data.length; i++) {
            if (String(fundsData.data[i].data_date_time) === String(data_date_time)) {
              return i; // return position
            }
          }
          return -1;
        }



      }

      // Return results
      res.json({
        funds: fundsData,
      });
    }).catch(error => {
      res.status(500);
      res.send(error);
    })
  });


}

exports.Funds = Funds;
