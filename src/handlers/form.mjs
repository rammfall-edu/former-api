import { appValidations } from '../validations/index.mjs';
import Form from '../models/Form.mjs';

export const createForm = {
  validationSchema: {
    body: {
      type: 'object',
      properties: {
        isOpen: appValidations.formIsOpen,
        title: appValidations.formTitle,
      },
      required: ['isOpen', 'title'],
    },
  },
  handler: async (request, reply) => {
    const { id } = request.user;
    const { title, isOpen } = request.body;
    const form = new Form({ title, isOpen, userId: id });
    await form.save();

    return reply.send({ info: 'Form created successfully', data: form });
  },
};

export const getForms = {
  handler: async (request, reply) => {
    const { id } = request.user;
    const forms = await Form.findAll({ where: { userId: id } });

    return reply.send(forms);
  },
};

export const updateForm = {
  validationSchema: {
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
  handler: async (request, reply) => {
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
  },
};

export const deleteForm = {
  validationSchema: {
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
  handler: async (request, reply) => {
    const { id: userId } = request.user;
    const { id } = request.params;
    const form = await Form.findOne({ where: { id, userId } });

    if (!form) {
      return reply.status(403).send({ info: 'Not permitted' });
    }
    await form.destroy();

    return reply.send({ info: 'Successfully deleted' });
  },
};

export const getForm = {
  validationSchema: {
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
  handler: async (request, reply) => {
    const { id: userId } = request.user;
    const { id } = request.params;
    const form = await Form.findOne({ where: { id, userId } });

    if (form) {
      return reply.send(form);
    }

    return reply.status(404).send({ info: 'Form does not exist' });
  },
};
