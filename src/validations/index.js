export const appValidations = {
  username: {
    type: 'string',
    minLength: 4,
    maxLength: 30,
  },
  email: {
    type: 'string',
    minLength: 4,
    maxLength: 30,
  },
  password: {
    type: 'string',
    minLength: 4,
    maxLength: 30,
  },
  firstName: {
    type: 'string',
    minLength: 2,
    maxLength: 15,
  },
  lastName: {
    type: 'string',
    minLength: 2,
    maxLength: 15,
  },
  phoneNumber: {
    type: 'string',
    minLength: 7,
    maxLength: 20,
  },
  dateOfBirth: {
    type: 'string',
    minLength: 4,
    maxLength: 50,
  },
};
