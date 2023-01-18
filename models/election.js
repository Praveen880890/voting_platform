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
    static addElection({ elecName, id, cstmUrl }) {
      return this.create({
        elecName,
        cstmUrl,
        id,
      });
    }
    static async getElections(id){
      return this.findAll({
        where:{
          id,
        }
      })
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