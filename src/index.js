import Fastify from 'fastify';
import { hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';

import User from './models/User';
import { appValidations } from './validations';
import Profile from './models/Profile';
import Form from './models/Form';
import './init';
import Field from './models/Field';

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

  instance.put(
    '/account/email',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            email: appValidations.email,
          },
          required: ['email'],
        },
      },
    },
    async (request, reply) => {
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
    }
  );

  instance.post(
    '/form',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            isOpen: appValidations.formIsOpen,
            title: appValidations.formTitle,
          },
          required: ['isOpen', 'title'],
        },
      },
    },
    async (request, reply) => {
      const { id } = request.user;
      const { title, isOpen } = request.body;
      const form = new Form({ title, isOpen, userId: id });
      await form.save();

      return reply.send({ info: 'Form created successfully' });
    }
  );

  instance.get('/form', async (request, reply) => {
    const { id } = request.user;
    const forms = await Form.findAll({ where: { userId: id } });

    return reply.send(forms);
  });

  instance.put(
    '/form/:id',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            isOpen: appValidations.formIsOpen,
            title: appValidations.formTitle,
            id: appValidations.id,
          },
          required: ['isOpen', 'title'],
        },
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
            },
          },
          required: ['id'],
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user;
      const { isOpen, title } = request.body;
      const { id } = request.params;
      const form = await Form.findOne({ where: { id, userId } });

      if (!form) {
        return reply.status(403).send({ info: 'Not permitted' });
      }
      form.isOpen = isOpen;
      form.title = title;
      await form.save();

      return reply.send({ info: 'Form updated successfully' });
    }
  );

  instance.delete(
    '/form/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'number',
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user;
      const { id } = request.params;
      const form = await Form.findOne({ where: { id, userId } });

      if (!form) {
        return reply.status(403).send({ info: 'Not permitted' });
      }
      await form.destroy();

      return reply.send({ info: 'Successfully deleted' });
    }
  );

  instance.get(
    '/form/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'number',
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user;
      const { id } = request.params;
      const form = await Form.findOne({ where: { id, userId } });

      if (form) {
        return reply.send(form);
      }

      return reply.status(404).send({ info: 'Form does not exist' });
    }
  );

  instance.post(
    '/form/:id',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            fields: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    minLength: 4,
                    maxLength: 20,
                    enum: ['text', 'textarea', 'select', 'radio', 'checkbox'],
                  },
                  name: {
                    type: 'string',
                    minLength: 4,
                    maxLength: 20,
                  },
                  label: {
                    type: 'string',
                    minLength: 4,
                    maxLength: 20,
                  },
                  placeholder: {
                    type: 'string',
                    minLength: 4,
                    maxLength: 20,
                  },
                  default: {
                    type: 'string',
                    minLength: 4,
                    maxLength: 20,
                  },
                },
                required: ['name', 'label', 'type'],
              },
            },
          },
          required: ['fields'],
        },
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'number',
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user;
      const { id } = request.params;
      const form = await Form.findOne({ where: { id, userId } });

      if (form) {
        const { fields } = request.body;
        await fields.forEach(
          async ({ type, label, placeholder, default: defaultValue, name }) => {
            const field = new Field({
              type,
              label,
              placeholder,
              default: defaultValue,
              name,
            });

            await field.save();
          }
        );

        return reply.send({});
      }

      return reply.status(404).send({ info: 'Form does not exist' });
    }
  );

  done();
});

export default fastify;
