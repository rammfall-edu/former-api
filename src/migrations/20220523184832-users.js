'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        nullable: false,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING,
        nullable: false,
      },
      email: {
        type: Sequelize.STRING,
        nullable: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        nullable: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
