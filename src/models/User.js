import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import Profile from './Profile';

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      nullable: false,
    },
    email: {
      type: DataTypes.STRING,
      nullable: false,
    },
    password: {
      type: DataTypes.STRING,
      nullable: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
  }
);

User.hasOne(Profile, {
  foreignKey: 'userId',
});

export default User;
