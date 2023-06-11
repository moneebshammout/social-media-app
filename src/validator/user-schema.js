const {
  stringSchema,
  emailSchema,
  dateSchema,
  inListSchema,
  numberSchema,
  arraySchema,
  oneOfTwoObjects,
} = require('./schema-helpers');

/**
 * @params {string} id
 * @params {string array} interests
 * @params {string} data.firstName
 * @params {string} data.lastName
 * @params {string} data.imageId
 * @params {string} data.gender
 * @params {string} data.location
 * @params {string} data.phone
 */
exports.createSchema = [
  emailSchema('data.email', true),
  dateSchema('data.birthDate'),
  arraySchema('interests'),
  ...stringSchema([
    'id',
    'data.name',
    'data.gender',
    'data.location',
    'data.provider',
    'data.userName',
    'interests.*',
    'profile.imageId',
  ]),
  ...stringSchema(['data.phone', 'profile.bio'], 'body', true),
];

/**
 * @params {string} id
 * @params {string?} data.firstName
 * @params {string?} data.lastName
 * @params {string?} data.imageId
 * @params {string?} data.gender
 * @params {string?} data.location
 * @params {string?} data.phone
 */
exports.updateSchema = [
  oneOfTwoObjects('user', 'profile'),
  ...stringSchema(['id']),
  emailSchema('user.email', true),
  dateSchema('user.birthDate', true),
  ...stringSchema(
    [
      'user.name',
      'user.userName',
      'user.gender',
      'user.location',
      'user.phone',
      'profile.bio',
      'profile.imageId',
      'profile.coverId',
      'profile.coverHistory.*',
      'profile.imageHistory.*',
    ],
    'body',
    true,
  ),
  arraySchema('profile.imageHistory', true),
  arraySchema('profile.coverHistory', true),
];

const relations = [
  'follow',
  'subscribe',
  'like',
  'dis_like',
  'un_certain',
  'right_like',
  'left_like',
  'post_up_vote',
  'post_down_vote',
];

/**
 * @params {string} fromId
 * @params {string} relation -->follow || like || dis_like || un_certain ||right_like
 * || left_like||up_vote||down_vote||subscribe
 */
exports.createRelationSchema = [
  ...stringSchema(['fromId', 'toId']),
  inListSchema('relation', relations),
];

/**
 * @params {string} fromId
 * @params {string} relation -->follow || like || dis_like || un_certain||right_like
 * || left_like||up_vote||down_vote||subscribe
 */
exports.deleteRelationSchema = [
  ...stringSchema(['fromId', 'toId']),
  inListSchema('relation', relations),
];

/**
 * @params {string} name
 * @params {number} page
 * @params {number} limit
 */
exports.usersByNameSchema = [
  ...stringSchema(['name'], 'query'),
  numberSchema('page', 'query'),
  numberSchema('limit', 'query', true),
];

/**
 * @params {string} userName
 */
exports.usersByUserNameSchema = [
  ...stringSchema(['userName'], 'query'),
  numberSchema('page', 'query'),
  numberSchema('limit', 'query', true),
];

/**
 * @params {string} viewerId
 * @params {string} ownerId
 */
exports.authorizeViewSchema = stringSchema(['viewerId', 'ownerId'], 'query');

exports.tagSchema = [
  arraySchema('userNames'),
  inListSchema('entity', ['Poll', 'Review', 'Post']),
  ...stringSchema(['entityId,userNames.*']),
];
