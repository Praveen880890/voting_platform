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
    static gtOptns(questionID) {
      return this.findAll({
        where: {
          questionID,
        },
        order: [["id", "ASC"]],
      });
    }
    static addOption({ option, questionID }) {
      return this.create({
        option,
        questionID,
      });
    }
    static gtOptn(id) {
      return this.findOne({
        where: {
          id,
        },
      });
    }

    static addOption({ option, questionID }) {
      return this.create({
        option,
        questionID,
      });
    }
    static gtOptns(questionID) {
      return this.findAll({
        where: {
          questionID,
        },
        order: [["id", "ASC"]],
      });
    }
    static updateOption({ option, id }) {
      return this.update(
        {
          option,
        },
        {
          where: {
            id,
          },
        }
      );
    }

    static deleteOption(id) {
      return this.destroy({
        where: {
          id,
        },
      });
    }

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