'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Answers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Answers.belongsTo(models.voter, {
        foreignKey: "voterID",
      });
      Answers.belongsTo(models.election, {
        foreignKey: "electionID",
      });
      Answers.belongsTo(models.question, {
        foreignKey: "questionID",
      });
      Answers.belongsTo(models.options, {
        foreignKey: "OptionBool",
      });
    }
    static addAnswer({ voterID, electionID, questionID, OptionBool }) {
      return this.create({
        voterID,
        electionID,
        questionID,
        OptionBool,
      });
    }
    
    
  }
  Answers.init({
   
  }, {
    sequelize,
    modelName: 'Answers',
  });
  return Answers;
};