const { ModelFactory } = require('neogma');

module.exports = (neogma) => {
  const Poll = ModelFactory(
    {
      label: ['Active', 'Poll'],
      schema: {
        id: {
          type: 'string',
          required: true,
        },
        type: {
          type: 'string',
          required: true,
        },
        description: {
          type: 'string',
          required: true,
        },
        imageId: {
          type: 'array',
          required: true,
        },
        createdDate: {
          type: 'string',
        },
        endedDate: {
          type: 'string',
        },
        ownerId: {
          type: 'string',
          required: true,
        },
        ownerName: {
          type: 'string',
          required: true,
        },
        ownerImageId: {
          type: 'string',
          required: true,
        },
      },
      primaryKeyField: 'id',
    },
    neogma,
  );

  return Poll;
};
