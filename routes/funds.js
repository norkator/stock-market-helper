const moment = require('moment');
const {Op} = require('sequelize');
const dotEnv = require('dotenv');
dotEnv.config();


function Funds(router, sequelizeObjects) {


  /**
   * Get funds chart
   */
  router.get('/get/funds/chart', function (req, res) {

    let dataValues = [];
    let fundsData = {'data': [], 'xkey': 'data_date_time', 'ykeys': [], 'labels': [], ymax: 0, ymin: 0};

    sequelizeObjects.Data.findAll({
      attributes: [
        'name_notation',
        'id_notation',
        'data_date_time',
        'data_value',
      ],
      where: {
        data_date_time: {
          [Op.gt]: moment().subtract(12, 'months'), // Loads 12 months
        }
      },
      order: [
        ['data_date_time', 'asc'],
        ['name_notation', 'asc'],
      ]
    }).then(rows => {
      if (rows.length > 0) {

        rows.forEach(row => {
          dataValues.push(row.data_value);
          const rowDateTime = new moment(row.data_date_time).format('YYYY-MM-DD');
          const dateTimePosition = fundDataHasDateTime(rowDateTime);
          if (dateTimePosition >= 0) {
            fundsData.data[dateTimePosition][row.id_notation] = row.data_value;
            if (fundsData.ykeys.indexOf(String(row.id_notation)) === -1) {
              fundsData.ykeys.push(String(row.id_notation));
            }
          } else {
            fundsData.data.push({
              'data_date_time': rowDateTime,
              [row.id_notation]: row.data_value
            });
            if (fundsData.ykeys.indexOf(String(row.id_notation)) === -1) {
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

        // Determine labels in order
        const d = fundsData.data[0];
        Object.keys(d).forEach(objectKey => {
          try {
            fundsData.labels.push(
              rows.filter(row => {
                return String(row.id_notation) === String(objectKey);
              })[0].name_notation
            );
          } catch (e) {
          }
        });

        // Determine max and min values for chart
        dataValues.sort(function (a, b) {
          return a - b;
        });
        fundsData.ymax = Math.floor(dataValues[dataValues.length - 1]) + 5;
        fundsData.ymin = Math.floor(dataValues[0]) - 5;
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
