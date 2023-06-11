const { ModelFactory } = require('neogma');

module.exports = (neogma) => {
  const Genre = ModelFactory(
    {
      label: 'Genre',
      schema: {
        name: {
          type: 'string',
          required: true,
        },
        primaryKeyField: 'name',
      },
    },
    neogma,
  );
  return Genre;
};
