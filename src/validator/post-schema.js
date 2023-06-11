const { oneOf } = require('express-validator');
const {
  stringSchema,
  booleanSchema,
  pagination,
  arraySchema,
  objectSchema,
} = require('./schema-helpers');

/**
 * @params {string} id
 * @params {boolean} paid
 * @params {string} data.ownerId
 * @params {string} data.imageId
 * @params {string} data.ownerImageId
 */
exports.createSchema = [
  oneOf(
    [
      ...stringSchema(['data.description'], 'body'),
      objectSchema('data.media', ['id', 'type']),
    ],
    'At least one of media or description',
  ),
  arraySchema('genres', true),
  ...stringSchema(['genres.*', 'media.type', 'media.id'], 'body', true),
  ...stringSchema([
    'id',
    'data.ownerId',
    'data.ownerName',
    'data.ownerImageId',
  ]),
  booleanSchema('paid'),
];

/**
 * @params {string} description
 * @params {number} page
 * @params {number} limit
 */
exports.postsByDescriptionSchema = [
  ...stringSchema(['description'], 'query'),
  ...pagination,
];

/**
 * @params {string} userId
 * @params {string} postId
 */
exports.repostSchema = [
  ...stringSchema(['userId', 'postId', 'repostId', 'description']),
];

/**
 * @params {string} id
 * @params {string} description
 */
exports.updateSchema = stringSchema(['id', 'description']);
