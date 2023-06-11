const { formatResponse, toNativeTypes } = require('../utils/requests');
const { queryInstance } = require('../queries/query');

/**
 * Get genres by name.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.getGenreByName = async (req, res) => {
  const { name, page, limit } = req.query;

  const result = await queryInstance.getGenreByName({ name, page, limit });

  res.send(formatResponse(toNativeTypes(result.records), 'genres fetched'));
};
