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
        onDelete:"CASCADE"
      });
    }
    static async getNumberOfVoters(electionID) {
      return await this.count({
        where: {
          electionID,
        },
      });
    }
    static async markAsVoted(id) {
      return await this.update(
        {
          didVote: true,
        },
        {
          where: {
            id,
          },
        }
      );
    }
    static async countVoted(electionID) {
      return await this.count({
        where: {
          electionID,
          didVote: true,
        },
      });
    }
    static async Pending(electionID) {
      return await this.count({
        where: {
          electionID,
          didVote: false,
        },
      });
    }
    static async createVoter({ voterUnqid, voterUnqPswd, electionID }) {
      return await this.create({
        voterUnqid,
        voterUnqPswd,
        electionID,
        didVote: false,
        position:"voter"
      });
    }
    static async countOFVoters(electionID) {
      return await this.count({
        where: {
          electionID,
        },
      });
    }
    static async getAllVoters(electionID) {
      return await this.findAll({
        where: {
          electionID,
        },
        order: [["id", "ASC"]],
      });
    }
    static async getVoters(electionID) {
      return await this.findAll({
        where: {
          electionID,
        },
        order: [["id", "ASC"]],
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