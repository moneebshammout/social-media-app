const { ModelFactory } = require('neogma');

module.exports = (neogma) => {
  const Review = ModelFactory(
    {
      label: 'Review',
      schema: {
        id: {
          type: 'string',
          required: true,
        },
        productName: {
          type: 'string',
          required: true,
        },
        productFirm: {
          type: 'string',
          required: true,
        },
        rate: {
          type: 'object',
        },
        description: {
          type: 'string',
          required: true,
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
      },
      primaryKeyField: 'id',
    },
    neogma,
  );

  return Review;
};
