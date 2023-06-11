const { ModelFactory } = require('neogma');

/**
 * This model will hold all the content that are in user paid profile.
 */

module.exports = (neogma) => {
  const Paid = ModelFactory(
    {
      label: 'Paid',
      schema: {
        id: {
          type: 'string',
          required: true,
        },
        primaryKeyField: 'id',
      },
    },
    neogma,
  );

  return Paid;
};
