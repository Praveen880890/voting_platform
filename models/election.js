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
      election.belongsTo(models.AdminCreate,{
        foreignKey:"adminID"
      });
      election.hasMany(models.question, {
        foreignKey: "electionID",
      });
      election.hasMany(models.voter, {
        foreignKey: "electionID",
      });
      election.hasMany(models.Answers, {
        foreignKey: "electionID",
      });
    }
    static launchElection(id) {
      return this.update(
        {
          Running: true,
        },
        {
          returning: true,
          where: {
            id,
          },
        }
      );
    }
    static endElection(id) {
      return this.update(
        {
          Running: false,
          Ended: true,
        },
        {
          returning: true,
          where: {
            id,
          },
        }
      );
    }
    static addElection({ elecName, adminID, cstmUrl }) {
      return this.create({
        elecName,
        cstmUrl,
        adminID,
      });
    }
    static async getElections(adminID){
      return this.findAll({
        where:{
          adminID,
        }
      })
    }
    static async getElectionURL(cstmUrl){
      return this.findOne({
        where:{
          cstmUrl,
        }
      })
    }
    static async getElection(id){
      return this.findOne({
        where:{
          id,
        }
      })
    }
    static getElectionWithId(id) {
      return this.findOne({
        where: {
          id,
        },
      });
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