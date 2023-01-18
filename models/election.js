'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class election extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  election.init({
    elecName: DataTypes.STRING,
    cstmUrl: DataTypes.STRING,
    Running: DataTypes.BOOLEAN,
    Ended: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'election',
  });
  return election;
};