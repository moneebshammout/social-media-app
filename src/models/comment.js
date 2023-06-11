const { ModelFactory } = require('neogma');

module.exports = (neogma) => {
  const Genre = ModelFactory(
    {
      label: 'Comment',
      schema: {
        id: {
          type: 'string',
          required: true,
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
        comment: {
          type: 'string',
          required: true,
        },
        createdDate: {
          type: 'string',
        },
        history: {
          type: 'array',
        },
        primaryKeyField: 'id',
      },
    },
    neogma,
  );
  return Genre;
};
