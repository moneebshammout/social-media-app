const {
  stringSchema,
  arraySchema,
  inListSchema,
  pagination,
} = require('./schema-helpers');

/**
 * @params {string} id
 * @params {string array} genres
 * @params {string} data.ownerId
 * @params {array} data.imageId
 * @params {string} data.ownerImageId
 */
exports.createSchema = [
  arraySchema('data.imageId'),
  ...stringSchema([
    'id',
    'data.ownerId',
    'data.ownerName',
    'data.ownerImageId',
    'data.imageId.*',
  ]),
  arraySchema('genres', true),
  ...stringSchema(['genres.*', 'data.description'], 'body', true),
  inListSchema('data.type', ['single', 'double']),
];

/**
 * @params {string} id  -->User id
 * @params {string array} genres
 * @params {number} page
 * @params {number?} limit
 */
exports.pollsByGenreSchema = [
  ...stringSchema(['genre'], 'query'),
  ...pagination,
];

exports.endPollSchema = stringSchema(['id', 'ownerId'], 'query');
