import { appValidations } from '../validations/index.mjs';
import User from '../models/User.mjs';
import { compare, hash } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../index.mjs';

const {sign} = jwt;

export const registration = {
  validationSchema: {
    body: {
      type: 'object',
      required: ['email', 'password', 'username'],
      properties: {
        email: appValidations.email,
        username: appValidations.username,
        password: appValidations.password,
      },
    },
  },
  handler: async (request, reply) => {
    const { username, email, password } = request.body;

    if (await User.findOne({ where: { email } })) {
      return reply
        .status(400)
        .send({ info: 'Email already exist', name: 'email' });
    } else {
      const user = new User({
        username,
        email,
        password: await hash(password, 10),
      });

      await user.save();
      return reply.send({ info: 'success' });
    }
  },
};

export const login = {
  validationSchema: {
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: appValidations.email,
        password: appValidations.password,
      },
    },
  },
  handler: async (request, reply) => {
    const { email, password } = request.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return reply
        .status(404)
        .send({ info: 'User does not exist', name: 'email' });
    } else if (user && (await compare(password, user.password))) {
      return reply.send({
        token: await sign(
          { email, id: user.id, username: user.username },
          SECRET_KEY,
          {
            expiresIn: '24h',
          }
        ),
        username: user.username,
        email,
      });
    } else {
      return reply
        .status(403)
        .send({ info: 'Incorrect password', name: 'password' });
    }
  },
};
