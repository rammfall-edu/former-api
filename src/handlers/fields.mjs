import Form from '../models/Form.mjs';
import Field from '../models/Field.mjs';

export const createFields = {
  validationSchema: {
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
  handler: async (request, reply) => {
    const { id: userId } = request.user;
    const { id } = request.params;
    const form = await Form.findOne({ where: { id, userId } });

    if (form) {
      const { fields } = JSON.parse(request.body);
      const fieldsFunctions = fields.map(
        ({
          type,
          label,
          placeholder,
          default: defaultValue,
          name,
          id,
          formId,
        }) => {
          const promise = async () => {
            let field;

            if (id && formId) {
              field = await Field.findOne({ where: { id, formId } });
            } else {
              field = new Field({
                type,
                label,
                placeholder,
                default: defaultValue,
                name,
                formId: form.id,
              });
            }

            await field.save();

            return field;
          };

          return promise();
        }
      );

      const createdFields = await Promise.all(fieldsFunctions);

      return reply.send(createdFields);
    }

    return reply.status(404).send({ info: 'Form does not exist' });
  },
};

export const getFields = {
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
      const fields = await Field.findAll({ where: { formId: form.id } });

      return reply.send(fields ? fields : []);
    }

    return reply.status(404).send({ info: 'Form does not exist' });
  },
};

export const deleteFields = {
  validationSchema: {
    params: {
      type: 'object',
      required: ['id', 'fieldId'],
      properties: {
        id: {
          type: 'number',
        },
        fieldId: {
          type: 'number',
        }
      },
    },
  },
  handler: async (request, reply) => {
    const { id: userId } = request.user;
    const { id, fieldId } = request.params;
    const form = await Form.findOne({ where: { id, userId } });

    if (form) {
      const field = await Field.findOne({
        where: { formId: form.id, id: fieldId },
      });

      await field.destroy();
      return reply.send({ info: 'Successfully deleted' });
    }

    return reply.status(404).send({ info: 'Form does not exist' });
  },
};
