import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import User from './User';
import Field from './Field';

class Form extends Model {}

Form.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      nullable: false,
    },
    isOpen: {
      type: DataTypes.BOOLEAN,
      nullable: false,
      default: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      nullable: false,
      foreignKey: true,
    },
  },
  {
    sequelize,
    tableName: 'form',
    timestamps: false,
  }
);

Form.belongsTo(User, {
  foreignKey: 'userId',
});

Form.hasMany(Field, {
  foreignKey: 'formId',
});

export default Form;
