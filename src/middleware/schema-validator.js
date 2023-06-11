const { validationResult } = require('express-validator');
const { formatResponse } = require('../utils/requests');

/**
 * Middleware for handling parameters validation.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 * @param {import('express').NextFunction} next Gives the controls for next middleware.
 */
module.exports = (req, res, next) => {
  const errorsList = validationResult(req);
  if (errorsList.isEmpty()) {
    return next();
  }

  return res.status(400).json(formatResponse(errorsList.array(), '', false));
};
