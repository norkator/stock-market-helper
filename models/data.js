module.exports = (sequelize, type) => {
  return sequelize.define('data', {
    id: {
      type: type.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },

    name_notation: type.STRING,

    id_notation: {
      type: type.INTEGER, defaultValue: 0
    },

    data_date_time: {
      type: type.DATE,
      defaultValue: sequelize.fn('NOW')
    },

    data_value: type.DECIMAL(10,2),

    createdAt: {
      type: type.DATE,
      defaultValue: sequelize.fn('NOW')
    },
    updatedAt: {
      type: type.DATE,
      defaultValue: sequelize.fn('NOW')
    },
  })
};
