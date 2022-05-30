import Fastify from 'fastify';
import { hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';

import User from './models/User';
import { appValidations } from './validations';
import Profile from './models/Profile';

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

fastify.register((instance, {}, done) => {
  instance.addHook('onRequest', async (request, reply) => {
    const { authorization } = request.headers;
    try {
      const userObj = await verify(authorization, SECRET_KEY);
      const user = await User.findOne({
        where: {
          id: userObj.id,
        },
      });

      request.user = user;
    } catch (e) {
      reply.status(403).send({ info: 'not correct token' });
    }
  });

  instance.post(
    '/profile',
    {
      schema: {
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
    },
    async (request, reply) => {
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
    }
  );

  instance.get('/profile', async (request, reply) => {
    const { id } = request.user;
    const profile = await Profile.findOne({ where: { userId: id } });

    if (profile) {
      return reply.send(profile);
    }

    return reply.send({});
  });

  instance.put(
    '/profile',
    {
      schema: {
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
    },
    async (request, reply) => {
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
    }
  );

  instance.put(
    '/account/password',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            password: appValidations.password,
            newPassword: appValidations.password,
          },
          required: ['password', 'newPassword'],
        },
      },
    },
    async (request, reply) => {
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
    }
  );

  done();
});

export default fastify;
