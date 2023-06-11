/* eslint-disable no-unused-vars */
const { formatResponse } = require('../utils/requests');

/**
 * Middleware for handling errors during request processing.
 *
 * @param {object} err Error object.
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 * @param {import('express').NextFunction} next Gives the controls for next middleware.
 */
module.exports = (err, req, res, next) => {
  res
    .status(err.statusCode ?? 400)
    .json(formatResponse(err.data, err.message, false));
};
