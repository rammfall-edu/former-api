import User from './models/User';
import Profile from './models/Profile';
import Form from './models/Form';
import Field from './models/Field';

User.hasOne(Profile, {
  foreignKey: 'userId',
});

User.hasMany(Form, {
  foreignKey: 'userId',
});

Field.belongsTo(Form, {
  foreignKey: 'formId',
});
