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
    static async gtOptnCount({ electionID, OptionBool, questionID }) {
      return await this.count({
        where: {
          electionID,
          OptionBool,
          questionID,
        },
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
    static async gtanswers(electionID) {
      return await this.findAll({
        where: {
          electionID,
        },
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