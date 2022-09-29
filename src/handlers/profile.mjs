import { appValidations } from '../validations/index.mjs';
import Profile from '../models/Profile.mjs';
import User from '../models/User.mjs';
import { compare, hash } from 'bcrypt';

export const createProfile = {
  validationSchema: {
    body: {
      type: 'object',
      properties: {
        firstName: appValidations.firstName,
        lastName: appValidations.lastName,
        phoneNumber: appValidations.phoneNumber,
        dateOfBirth: appValidations.dateOfBirth,
      },
    },
  },
  handler: async (request, reply) => {
    const { id } = request.user;
    const {
      firstName = '',
      lastName = '',
      phoneNumber = '',
      dateOfBirth = new Date(),
    } = request.body;

    const profile = new Profile({
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      userId: id,
    });

    await profile.save();

    reply.send(profile);
  },
};

export const getProfile = {
  handler: async (request, reply) => {
    const { id } = request.user;
    const profile = await Profile.findOne({ where: { userId: id } });

    if (profile) {
      return reply.send(profile);
    }

    return reply.send({});
  },
};

export const updateProfile = {
  validationSchema: {
    body: {
      type: 'object',
      properties: {
        firstName: appValidations.firstName,
        lastName: appValidations.lastName,
        phoneNumber: appValidations.phoneNumber,
        dateOfBirth: appValidations.dateOfBirth,
      },
    },
  },
  handler: async (request, reply) => {
    const { id } = request.user;
    const profile = await Profile.findOne({ where: { userId: id } });
    const {
      firstName = '',
      lastName = '',
      phoneNumber = '',
      dateOfBirth = new Date(),
    } = request.body;

    if (profile) {
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.phoneNumber = phoneNumber;
      profile.dateOfBirth = dateOfBirth;

      await profile.save();
      return reply.send(profile);
    }

    return reply.status(404).send({ info: 'Profile does not exist' });
  },
};

export const updatePassword = {
  validationSchema: {
    body: {
      type: 'object',
      properties: {
        password: appValidations.password,
        newPassword: appValidations.password,
      },
      required: ['password', 'newPassword'],
    },
  },
  handler: async (request, reply) => {
    const { id } = request.user;
    const { password, newPassword } = request.body;
    const user = await User.findOne({ where: { id } });

    if (await compare(password, user.password)) {
      user.password = await hash(newPassword, 10);
      await user.save();

      return reply.send({ info: 'Password was successfully changed' });
    }

    return reply
      .status(403)
      .send({ info: 'Password not compared', name: 'password' });
  },
};

export const updateEmail = {
  validationSchema: {
    body: {
      type: 'object',
      properties: {
        email: appValidations.email,
      },
      required: ['email'],
    },
  },
  handler: async (request, reply) => {
    const { id } = request.user;
    const { email } = request.body;
    const user = await User.findOne({ where: { id } });
    if (await User.findOne({ where: { email } })) {
      return reply
        .status(403)
        .send({ info: 'Email already exist', name: 'email' });
    }

    user.email = email;

    await user.save();
    return reply.send({ info: 'Email was successfully changed' });
  },
};
