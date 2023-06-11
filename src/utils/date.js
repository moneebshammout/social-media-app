const dateFormat = require('date-format');

/**
 * Format the current date for neo4j db.
 *
 * @return {string} Current date formatted yyyy-mm-dd.
 */
exports.currentDate = () => dateFormat.asString('yyyy-MM-dd hh:mm', new Date());
