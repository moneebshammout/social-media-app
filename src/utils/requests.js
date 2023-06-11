const { neo4jDriver } = require('neogma');

const {
  isInt,
  isDate,
  isDateTime,
  isTime,
  isLocalDateTime,
  isLocalTime,
  isDuration,
} = neo4jDriver;

/**
 * One response format for all requests.
 *
 * @param {object} res Database response.
 * @param {string} message Message for front-end.
 * @param {boolean} success Requests success or not.
 *
 * @return {object} Formatted response.
 */
exports.formatResponse = (res, message, success = true) => ({
  data: res,
  msg: message,
  success,
});

function isJson(value) {
  try {
    JSON.parse(value);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Convert an individual value to its JavaScript equivalent
 *
 * @param {any} value
 * @returns {any}
 */
function valueToNativeType(value) {
  let result;
  if (Array.isArray(value)) {
    result = value.map((innerValue) => valueToNativeType(innerValue));
  } else if (isInt(value)) {
    result = value.toNumber();
  } else if (
    isDate(value) ||
    isDateTime(value) ||
    isTime(value) ||
    isLocalDateTime(value) ||
    isLocalTime(value) ||
    isDuration(value)
  ) {
    result = value.toString();
  } else if (
    typeof value === 'object' &&
    value !== undefined &&
    value !== null
  ) {
    // eslint-disable-next-line no-use-before-define
    result = objectsToNativeTypes(value);
  } else if (typeof value === 'string' && isJson(value)) {
    result = JSON.parse(value);
  } else {
    result = value;
  }

  return result;
}

/**
 * Fixing query result in property objects to make them suitable for javascript.
 *
 * @param {object} object Query result inline objects.
 *
 * @return {object}
 */
function objectsToNativeTypes(object) {
  return Object.fromEntries(
    Object.keys(object).map((key) => {
      const value = valueToNativeType(object[key]);
      return [key, value];
    }),
  );
}

/**
 * Convert Neo4j Properties back into JavaScript types
 *
 * @param {Array.<Record<string, any>>} records
 * @return {Record<string, any>}
 */
exports.toNativeTypes = (records) =>
  records.map((record) => {
    let modifiedData = Object.fromEntries(
      record.keys.map((key) => {
        const value = valueToNativeType(record.get(key));
        return [key, value];
      }),
    );
    if ('properties' in modifiedData) {
      modifiedData = {
        ...modifiedData,
        properties: undefined,
        ...modifiedData.properties,
      };
    }
    return modifiedData;
  });
