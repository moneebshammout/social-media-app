const { ModelFactory } = require('neogma');

module.exports = (neogma) => {
  const Post = ModelFactory(
    {
      label: 'Post',
      schema: {
        id: {
          type: 'string',
          required: true,
        },
        description: {
          type: 'string',
        },
        media: {
          type: 'string',
        },
        createdDate: {
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
        history: {
          type: 'array',
        },
      },
      primaryKeyField: 'id',
    },
    neogma,
  );

  return Post;
};
