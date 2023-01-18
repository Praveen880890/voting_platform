'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class voter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      voter.belongsTo(models.election, {
        foreignKey: "electionID",
      });
      voter.hasMany(models.Answers, {
        foreignKey: "voterID",
      });
    }
    static async getNumberOfVoters(electionID) {
      return await this.count({
        where: {
          electionID,
        },
      });
    }
  }
  voter.init({
    voterUnqid: DataTypes.STRING,
    voterUnqPswd: DataTypes.STRING,
    didVote: DataTypes.BOOLEAN,
    position: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'voter',
  });
  return voter;
};