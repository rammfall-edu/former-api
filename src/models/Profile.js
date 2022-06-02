import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import User from './User';

class Profile extends Model {}

Profile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      nullable: true,
    },
    lastName: {
      type: DataTypes.STRING,
      nullable: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      nullable: true,
    },
    photo: {
      type: DataTypes.STRING,
      nullable: true,
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      nullable: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      nullable: false,
      foreignKey: true,
    },
  },
  {
    sequelize,
    tableName: 'profile',
    timestamps: false,
  }
);

Profile.sync().then(() => {
  Profile.belongsTo(User, {
    foreignKey: 'userId',
  });
});

export default Profile;
