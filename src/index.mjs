import Fastify from 'fastify';
import { hash, compare } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
const  {verify} = jwt;

import User from './models/User.mjs';
import { appValidations } from './validations/index.mjs';
import Profile from './models/Profile.mjs';
import Form from './models/Form.mjs';
import './init.mjs';
import Field from './models/Field.mjs';
import { login, registration } from './handlers/user.mjs';
import {
  createProfile,
  getProfile,
  updateEmail,
  updatePassword,
  updateProfile,
} from './handlers/profile.mjs';
import {
  createForm,
  deleteForm,
  getForm,
  getForms,
  updateForm,
} from './handlers/form.mjs';
import { createFields, deleteFields, getFields } from './handlers/fields.mjs';
import { answerGetForm } from './handlers/answer.mjs';

export const SECRET_KEY = 'very secret';
const fastify = Fastify({
  logger: true,
});

fastify.register(import('@fastify/cors'));
fastify.register(import('@fastify/swagger'),{
  routePrefix: '/documentation',
  swagger: {
    info: {
      title: 'Bank API doc',
      description: 'Testing the Fastify swagger API',
      version: '0.1.0'
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here'
    },
    host: 'localhost',
    schemes: ['http'],
    consumes: ['application/json', 'multipart/form-data'],
    produces: ['application/json', 'multipart/form-data'],
    securityDefinitions: {
      apiKey: {
        type: 'apiKey',
        name: 'apiKey',
        in: 'header'
      }
    }
  },
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  uiHooks: {
    onRequest: function(request, reply, next) {
      next();
    },
    preHandler: function(request, reply, next) {
      next();
    }
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  exposeRoute: true
});
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

fastify.post('/users', async (request, reply) => {
  reply.send(await User.findAll());
});

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

  instance.get(
    '/form/:id/fields',
    {
      schema: getFields.validationSchema,
    },
    getFields.handler
  );

  instance.delete(
    '/form/:id/fields/:fieldId',
    {
      schema: deleteFields.validationSchema,
    },
    deleteFields.handler
  );

  done();
});

fastify.get(
  '/answer/:id',
  {
    schema: answerGetForm.validationSchema,
  },
  answerGetForm.handler
);

export default fastify;
