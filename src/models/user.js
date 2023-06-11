const { ModelFactory } = require('neogma');

module.exports = (neogma) => {
  const User = ModelFactory(
    {
      label: 'User',
      schema: {
        id: {
          type: 'string',
          required: true,
        },
        name: {
          type: 'string',
          required: true,
        },
        email: {
          type: 'string',
          format: 'email',
        },
        gender: {
          type: 'string',
          required: true,
        },
        location: {
          type: 'string',
          required: true,
        },
        phone: {
          type: 'string',
        },
        totalLike: {
          type: 'object',
        },
        totalDislike: {
          type: 'object',
        },
        birthDate: {
          type: 'string',
          required: true,
        },
        provider: {
          type: 'string',
          required: true,
        },
        userName: {
          type: 'string',
          required: true,
        },
      },
      primaryKeyField: 'id',
    },
    neogma,
  );

  return User;
};
