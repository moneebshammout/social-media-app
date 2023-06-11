const { NODE_ENV } = process.env;

/**
 *
 * @return {boolean} True if in development environment
 */
exports.isDevEnv = () => NODE_ENV === 'development';
