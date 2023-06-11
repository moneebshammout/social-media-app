const { oneOf } = require('express-validator');
const {
  stringSchema,
  booleanSchema,
  numberSchema,
  pagination,
  objectSchema,
  arraySchema,
} = require('./schema-helpers');

/**
 * @params {string} id
 * @params {boolean} paid
 * @params {string array} genres
 * @params {string} data.ownerId
 * @params {object} data.media
 * @params {string} data.ownerImageId
 * @params {number} data.rate
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
    'data.productName',
    'data.productFirm',
  ]),
  numberSchema('data.rate'),
  booleanSchema('paid'),
];

/**
 * @params {string} description
 * @params {number} page
 * @params {number} limit
 */
exports.reviewsByNamesSchema = [
  ...stringSchema(['name'], 'query'),
  ...pagination,
];
