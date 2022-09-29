import { DataTypes, Model } from 'sequelize';
import sequelize from '../db.mjs';

class Field extends Model {}

Field.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      nullable: false,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('text', 'textarea', 'select', 'radio', 'checkbox'),
      nullable: false,
      default: 'text',
    },
    label: {
      type: DataTypes.STRING,
      nullable: false,
    },
    placeholder: {
      type: DataTypes.STRING,
      nullable: true,
    },
    default: {
      type: DataTypes.STRING,
      nullable: true,
    },
    name: {
      type: DataTypes.STRING,
      nullable: false,
    },
    formId: {
      type: DataTypes.INTEGER,
      nullable: false,
      foreignKey: true,
    },
  },
  {
    sequelize,
    tableName: 'field',
    timestamps: false,
  }
);

export default Field;
