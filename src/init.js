import User from './models/User';
import Profile from './models/Profile';
import Form from './models/Form';

User.hasOne(Profile, {
  foreignKey: 'userId',
});

User.hasMany(Form, {
  foreignKey: 'userId',
});
