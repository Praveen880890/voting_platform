"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Answers", "voterID", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("Answers", {
      fields: ["voterID"],
      type: "foreign key",
      references: {
        table: "voters",
        field: "id",
      },
    });
    await queryInterface.addColumn("Answers", "electionID", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("Answers", {
      fields: ["electionID"],
      type: "foreign key",
      references: {
        table: "elections",
        field: "id",
      },
    });
    await queryInterface.addColumn("Answers", "questionID", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("Answers", {
      fields: ["questionID"],
      type: "foreign key",
      references: {
        table: "questions",
        field: "id",
      },
    });
    await queryInterface.addColumn("Answers", "OptionBool", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
    });
    await queryInterface.addConstraint("Answers", {
      fields: ["OptionBool"],
      type: "foreign key",
      references: {
        table: "options",
        field: "id",
      },
    });

    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Answers", "voterID");
    await queryInterface.removeColumn("Answers", "electionID");
    await queryInterface.removeColumn("Answers", "questionID");
    await queryInterface.removeColumn("Answers", "OptionBool");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};