const { body, query, oneOf } = require('express-validator');

/**
 * Create array of string validation fields.
 *
 * @param {Array.<string>} attributeList List of attributes in schema.
 * @param {string?} type Parameter place body or query.
 * @param {boolean?} optional If attributes are optional.
 *
 * @return {Array.<import('express-validator').ValidationChain>} Validation list.
 */
exports.stringSchema = (attributeList, type = 'body', optional = false) => {
  const chainType = type === 'body' ? body : query;
  if (optional) {
    return attributeList.map((attribute) =>
      chainType(attribute)
        .optional()
        .isString()
        .bail()
        .withMessage('must be string'),
    );
  }

  return attributeList.map((attribute) =>
    chainType(attribute)
      .exists({ checkFalsy: true })
      .bail()
      .withMessage(`${attribute} is null`)
      .isString()
      .bail()
      .withMessage('must be string'),
  );
};

/**
 * Create date validation field.
 *
 * @param {string} attribute
 * @param {boolean} optional If attribute is optional.
 *
 * @return {import('express-validator').ValidationChain} Validation field.
 */
exports.dateSchema = (attribute, optional = false) => {
  if (optional) {
    return body(attribute)
      .optional()
      .isISO8601()
      .bail()
      .withMessage('must be valid date 2022-5-20');
  }
  return body(attribute)
    .exists({ checkFalsy: true })
    .bail()
    .withMessage(`${attribute} is null`)
    .isISO8601()
    .bail()
    .withMessage('must be valid date 2022-05-09');
};

/**
 * Create email validation field.
 *
 * @param {string} attribute
 * @param {boolean} optional If attribute is optional.
 *
 * @return {import('express-validator').ValidationChain} Validation field.
 */
exports.emailSchema = (attribute, optional = false) => {
  if (optional) {
    return body(attribute)
      .optional()
      .isEmail()
      .bail()
      .withMessage('must be valid email example@example.com');
  }
  return body(attribute)
    .exists({ checkFalsy: true })
    .bail()
    .withMessage(`${attribute} is null`)
    .isEmail()
    .bail()
    .withMessage('must be valid email example@example.com');
};

/**
 * Create array validation field.
 *
 * @param {string} attribute
 * @param {boolean} optional If attribute is optional.
 *
 */
exports.arraySchema = (attribute, optional = false) => {
  if (optional) {
    return body(attribute)
      .optional()
      .isArray({ min: 1 })
      .bail(`${attribute} is NULL`);
  }
  return body(attribute)
    .exists({ checkFalsy: true })
    .bail()
    .withMessage(`${attribute} is NULL`)
    .isArray({ min: 1 })
    .bail()
    .withMessage(`${attribute} must be an array`);
};

/**
 * Create in list validation field.
 *
 * @param {string} attribute Attribute name.
 * @param {string?} type Parameter place body or query.
 * @param {array.<string>} allowedList Allowed items to be used in IN close.
 *
 * @return {import('express-validator').ValidationChain} Validation field.
 */
exports.inListSchema = (attribute, allowedList, type = 'body') =>
  this.stringSchema([attribute], type)[0]
    .isIn(allowedList)
    .bail()
    .withMessage(`${attribute} must be one of these values ${allowedList}`);

/**
 * Create number validation field.
 *
 * @param {string} attribute Attribute name.
 * @param {string} type Parameter place body or query.
 * @param {boolean} optional If attribute is optional.
 *
 * @return {import('express-validator').ValidationChain} Validation field.
 */
exports.numberSchema = (attribute, type = 'body', optional = false) => {
  const chainType = type === 'body' ? body : query;
  if (optional) {
    return chainType(attribute)
      .optional()
      .isInt()
      .bail()
      .withMessage(`${attribute} must be an integer`);
  }

  return chainType(attribute)
    .exists({ checkFalsy: true })
    .bail()
    .withMessage(`${attribute} is null`)
    .isInt()
    .bail()
    .withMessage(`${attribute} must be an integer`);
};

/**
 * Create boolean validation field.
 *
 * @param {string} attribute Attribute name.
 *
 * @return {import('express-validator').ValidationChain} Validation field.
 */
exports.booleanSchema = (attribute) =>
  body(attribute)
    .exists({ checkNull: true })
    .bail()
    .withMessage(`${attribute} is null`)
    .isBoolean()
    .bail()
    .withMessage(`${attribute} must be an boolean`);

/**
 *  Id query validation field.
 *
 * @return {import('express-validator').ValidationChain} Validation field.
 */
exports.idSchema = query('id')
  .exists({ checkFalsy: true })
  .bail()
  .withMessage('id is null')
  .isString()
  .bail()
  .withMessage('must be string');

/**
 * Create pagination fields.
 * @type {string} id
 * @type {number} page
 * @type {number?} limit
 * @type {string?} search query
 */
exports.pagination = [
  this.idSchema,
  this.numberSchema('page', 'query'),
  this.numberSchema('limit', 'query', true),
  this.stringSchema(['search'], 'query', true),
];

/**
 * Create name pagination fields.
 * @type {string} name
 * @type {number} page
 * @type {number?} limit
 */
exports.namePagination = [
  ...this.stringSchema(['name'], 'query'),
  this.numberSchema('page', 'query'),
  this.numberSchema('limit', 'query', true),
];

/**
 * Create pagination fields.
 * @type {string} ownerId
 * @type {string} viewerId
 * @type {number} page
 * @type {number?} limit
 */
exports.viewerPagination = [
  ...this.stringSchema(['ownerId', 'viewerId'], 'query'),
  this.numberSchema('page', 'query'),
  this.numberSchema('limit', 'query', true),
];

/**
 * Create object validation field.
 *
 * @param {string} name Object name.
 * @param {Array.<string>} attributeList Object name.
 * @param {boolean?} optional If attributes are optional.
 *
 * @return {import('express-validator').ValidationChain} Validation list.
 */
exports.objectSchema = (name, attributeList, optional = false) => {
  if (optional) {
    return body(name)
      .optional()
      .isObject({ strict: true })
      .bail()
      .withMessage(`${name} is not an object`)
      .custom((input) => {
        attributeList.foreach((attribute) => {
          if (!Object.prototype.hasOwnProperty.call(input, attribute)) {
            throw new Error(`${name} doesn't have ${attribute} key`);
          }
        });
        return true;
      });
  }
  return body(name)
    .exists({ checkFalsy: true })
    .bail()
    .withMessage(`${name} is null`)
    .isObject({ strict: true })
    .bail()
    .withMessage(`${name} is not an object`)
    .custom((input) => {
      attributeList.forEach((attribute) => {
        if (!Object.prototype.hasOwnProperty.call(input, attribute)) {
          throw new Error(`${name} doesn't have ${attribute} key`);
        }
      });
      return true;
    });
};

/**
 * Validate that one of two objects is present.
 *
 * @param {string} obj1 Object name.
 * @param {string} obj2 Object name.
 *
 * @returns  {import('express-validator').ValidationChain} Validation field.
 */
exports.oneOfTwoObjects = (obj1, obj2) =>
  oneOf(
    [
      body(obj1).exists().isObject().withMessage(`${obj1} must be object`),
      body(obj2).exists().isObject().withMessage(`${obj2} must be object`),
    ],
    `One of the ${obj1} ${obj2} is required`,
  );
