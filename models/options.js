'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class options extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      options.belongsTo(models.question, {
        foreignKey: "questionID",
        onDelete: "CASCADE",
      });
      options.hasMany(models.Answers, {
        foreignKey: "OptionBool",
      });
    }
  }
  options.init({
    option: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'options',
  });
  return options;
};