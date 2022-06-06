'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('field', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        nullable: false,
        primaryKey: true,
      },
      type: {
        type: Sequelize.ENUM('text', 'textarea', 'select', 'radio', 'checkbox'),
        nullable: false,
        default: 'text',
      },
      label: {
        type: Sequelize.STRING,
        nullable: false,
      },
      placeholder: {
        type: Sequelize.STRING,
        nullable: true,
      },
      default: {
        type: Sequelize.STRING,
        nullable: true,
      },
      name: {
        type: Sequelize.STRING,
        nullable: false,
      },
    });

    await queryInterface.addColumn('field', 'formId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'form',
        key: 'id',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('field');
  },
};
