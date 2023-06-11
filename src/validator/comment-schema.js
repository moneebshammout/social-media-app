const { stringSchema, pagination, inListSchema } = require('./schema-helpers');

/**
 * @params {string} id
 * @params {string} pollId
 * @params {string} data.ownerId
 * @params {string} data.ownerImageId
 * @params {string} data.comment
 */
exports.createSchema = [
  ...stringSchema([
    'id',
    'data.ownerId',
    'data.ownerName',
    'data.ownerImageId',
    'data.comment',
    'entity',
    'entityId',
  ]),
  inListSchema('entity', ['Poll', 'Post', 'Comment']),
];

exports.getSchema = [
  ...pagination,
  inListSchema('entity', ['Post', 'Poll', 'Comment'], 'query'),
];

/**
 * @params {string} id
 * @params {string} comment
 */
exports.updateSchema = stringSchema(['id', 'comment']);
