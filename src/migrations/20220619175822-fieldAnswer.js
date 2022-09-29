'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fieldAnswer', {
      value: {
        type: Sequelize.STRING,
        nullable: true,
      },
    });

    await queryInterface.addColumn('fieldAnswer', 'answerId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'field',
        key: 'id',
      },
    });

    await queryInterface.addColumn('fieldAnswer', 'fieldId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'answer',
        key: 'id',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('fieldAnswer');
  },
};
