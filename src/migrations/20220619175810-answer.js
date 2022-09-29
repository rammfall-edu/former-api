'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('answer', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        nullable: false,
        primaryKey: true,
      },
    });

    await queryInterface.addColumn('answer', 'formId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'form',
        key: 'id',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('answer');
  },
};
