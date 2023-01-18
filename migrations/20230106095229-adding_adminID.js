"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("elections", "adminID", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("elections", {
      fields: ["adminID"],
      type: "foreign key",
      references: {
        table: "AdminCreates",
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
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};