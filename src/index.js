import Fastify from 'fastify';
import { hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';

import User from './models/User';
import { appValidations } from './validations';
import Profile from './models/Profile';
import Form from './models/Form';
import './init';
import Field from './models/Field';
import { login, registration } from './handlers/user';
import {
  createProfile,
  getProfile,
  updateEmail,
  updatePassword,
  updateProfile,
} from './handlers/profile';
import {
  createForm,
  deleteForm,
  getForm,
  getForms,
  updateForm,
} from './handlers/form';
import { createFields } from './handlers/fields';

export const SECRET_KEY = 'very secret';
const fastify = Fastify({
  logger: true,
});

fastify.register(import('@fastify/cors'));
fastify.register(import('@fastify/multipart'), {
  addToBody: true,
});
fastify.register(import('@fastify/cookie'));

fastify.post(
  '/register',
  {
    schema: registration.validationSchema,
  },
  registration.handler
);

fastify.post(
  '/login',
  {
    schema: login.validationSchema,
  },
  login.handler
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
      schema: createProfile.validationSchema,
    },
    createProfile.handler
  );

  instance.get('/profile', getProfile.handler);

  instance.put(
    '/profile',
    {
      schema: updateProfile.validationSchema,
    },
    updateProfile.handler
  );

  instance.put(
    '/account/password',
    {
      schema: updatePassword.validationSchema,
    },
    updatePassword.handler
  );

  instance.put(
    '/account/email',
    {
      schema: updateEmail.validationSchema,
    },
    updateEmail.handler
  );

  instance.post(
    '/form',
    {
      schema: createForm.validationSchema,
    },
    createForm.handler
  );

  instance.get('/form', getForms.handler);

  instance.put(
    '/form/:id',
    {
      schema: updateForm.validationSchema,
    },
    updateForm.handler
  );

  instance.delete(
    '/form/:id',
    {
      schema: deleteForm.validationSchema,
    },
    deleteForm.handler
  );

  instance.get(
    '/form/:id',
    {
      schema: getForm.validationSchema,
    },
    getForm.handler
  );

  instance.post(
    '/form/:id',
    {
      // schema: createFields.validationSchema,
    },
    createFields.handler
  );

  done();
});

export default fastify;
