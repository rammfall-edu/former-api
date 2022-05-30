'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('profile', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        nullable: false,
        primaryKey: true,
      },
      firstName: {
        type: Sequelize.STRING,
        nullable: true,
      },
      lastName: {
        type: Sequelize.STRING,
        nullable: true,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        nullable: true,
      },
      photo: {
        type: Sequelize.STRING,
        nullable: true,
      },
      dateOfBirth: {
        type: Sequelize.DATE,
        nullable: true,
      },
    });

    await queryInterface.addColumn('profile', 'userId', {
      type: Sequelize.INTEGER,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('profile');
  },
};
