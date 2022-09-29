import User from './models/User.mjs';
import Profile from './models/Profile.mjs';
import Form from './models/Form.mjs';
import Field from './models/Field.mjs';

User.hasOne(Profile, {
  foreignKey: 'userId',
});

User.hasMany(Form, {
  foreignKey: 'userId',
});

Field.belongsTo(Form, {
  foreignKey: 'formId',
});
