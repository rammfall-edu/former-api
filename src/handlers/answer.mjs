import Form from '../models/Form.mjs';
import Field from '../models/Field.mjs';

export const answerGetForm = {
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
    const { id } = request.params;
    const form = await Form.findOne({ where: { id } });

    if (form) {
      if (form.isOpen) {
        const fields = await Field.findAll({ where: { formId: id } });

        return reply.send({ form, fields: fields ? fields : [] });
      }

      return reply
        .status(403)
        .send({ info: 'You have not permissions for this form' });
    }
    return reply.status(404).send({ info: 'Form does not exist' });
  },
};
