const { createClient } = require('redis');

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

/**
 * Establish connection with redis server.
 */
exports.establishRedisConnection = async () => client.connect();

/**
 * Get cache from redis.
 *
 * @param {string} key Key name.
 *
 * @return {object} Cache value.
 */
exports.getCache = async (key) => JSON.parse(await client.get(key));

/**
 * Cache a key value pair  in redis with no expiry.
 *
 * @param {object} params Parameters object.
 * @param {string} params.key Key name.
 * @param {object} params.value Value of cache
 *
 * @return {object} Cache value.
 */
exports.saveCache = async ({ key, value }) =>
  client.SET(key, JSON.stringify(value));

/**
 * Cache a key value pair  in redis with  expiry.
 *
 * @param {object} params Parameters object.
 * @param {string} params.key Key name.
 * @param {number} params.seconds Expiry time in seconds.
 * @param {object} params.value Value of cache.
 *
 * @return {object} Cache value.
 */
exports.saveTempCache = async ({ key, seconds, value }) =>
  client.setEx(key, seconds, JSON.stringify(value));

/**
 * Delete cache if exist.
 *
 * @param {string|array} key Key name or keys array of cached value.
 */
exports.deleteCache = async (key) => client.del(key);

exports.deleteCacheByPattern = async (pattern) => {
  const keys = await client.keys(pattern);
  if (keys.length) return this.deleteCache(keys);
  return null;
};
