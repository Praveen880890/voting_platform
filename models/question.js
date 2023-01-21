'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      question.belongsTo(models.election, {
        foreignKey: "electionID",
      });
      question.hasMany(models.options, {
        foreignKey: "questionID",
      });
      question.hasMany(models.Answers, {
        foreignKey: "questionID",
      });
    }
    static async getNumberOfQuestions(electionID) {
      return await this.count({
        where: {
          electionID,
        },
      });
    }
    static async gtQuestn(id) {
      return await this.findOne({
        where: {
          id,
        },
      });
    }
    static updateQuestion({ elecQuestion, elecDescription, id }) {
      return this.update(
        {
          elecQuestion,
          elecDescription,
        },
        {
          returning: true,
          where: {
            id,
          },
        }
      );
    }
    static async gtQuestns(electionID) {
      return await this.findAll({
        where: {
          electionID,
        },
        order: [["id", "ASC"]],
      });
    }
    static async addQuestions({ elecQuestion, elecDescription, electionID }) {
      return this.create({
        elecQuestion,
        elecDescription,
        electionID,
      });
    }
    static updateQuestion({ question, description, id }) {
      return this.update(
        {
          question,
          description,
        },
        {
          returning: true,
          where: {
            id,
          },
        }
      );
    }
    static deleteQuestion(id) {
      return this.destroy({
        where: {
          id,
        },
      });
    }

  }
  question.init({
    elecQuestion: DataTypes.STRING,
    elecDescription: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'question',
  });
  return question;
};