import Fastify from 'fastify';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';

import User from './models/User';
import { appValidations } from './validations';

const SECRET_KEY = 'very secret';
const fastify = Fastify({
  logger: true,
});

fastify.register(import('@fastify/cors'));
fastify.register(import('@fastify/multipart'), {
  addToBody: true,
});
fastify.register(import('@fastify/cookie'));

fastify.get('/hello', (request, reply) => {
  return reply.send('world');
});

fastify.post(
  '/register',
  {
    schema: {
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
  },
  async (request, reply) => {
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
  }
);

fastify.post(
  '/login',
  {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: appValidations.email,
          password: appValidations.password,
        },
      },
    },
  },
  async (request, reply) => {
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
  }
);

export default fastify;
