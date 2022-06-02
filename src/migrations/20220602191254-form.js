'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('form', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        nullable: false,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        nullable: false,
      },
      isOpen: {
        type: Sequelize.BOOLEAN,
        nullable: false,
        default: true,
      },
    });

    await queryInterface.addColumn('form', 'userId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('form');
  },
};
