const { saveTempCache } = require('../utils/redis');
const { paidByMeCache, feedCache } = require('../constants');
const { formatResponse, toNativeTypes } = require('../utils/requests');
const FeedQueries = require('../queries/feed.queries');

/**
 * Generates a feed rout handler.
 *
 * @param {string} type Feed paid or following.
 *
 * @return {Promise} Rout handler.
 */
exports.getFeed =
  (type) =>
  /**
   * Gets paid or following feed.
   *
   * @param {import('express').Request} req Request object.
   * @param {import('express').Response} res Response object.
   */
  async (req, res) => {
    const { id, page, limit } = req.query;
    let result;
    if (type === 'Paid') {
      const data = await FeedQueries.paidFeed({ id, page, limit });
      result = toNativeTypes(data.records);
    } else {
      const data = await FeedQueries.followingFeed({ id, page, limit });
      result = toNativeTypes(data.records);
    }

    await saveTempCache({
      key: `feed${type}Page${page}For${id}`,
      seconds: feedCache,
      value: result,
    });

    res.send(formatResponse(result, `${type} Feed fetched`));
  };

/**
 * Fetch user paid content.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.getUserPaidContent = async (req, res) => {
  const { id, page, limit } = req.query;
  const data = await FeedQueries.userPaidFeed({ id, page, limit });
  const result = toNativeTypes(data.records);
  await saveTempCache({
    key: `paidBy${id}Page${page}`,
    seconds: paidByMeCache,
    value: result,
  });

  res.send(formatResponse(result, `User Paid Feed fetched`));
};

/**
 * Get user Content.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.getUserContent = async (req, res) => {
  const { id, page, limit } = req.query;
  const data = await FeedQueries.userContent({ id, page, limit });
  const result = toNativeTypes(data.records);

  res.send(formatResponse(result, `User Content fetched`));
};

/**
 * Get content user tagged in.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.getTaggedInContent = async (req, res) => {
  const { id, page, limit } = req.query;
  const data = await FeedQueries.taggedContent({ id, page, limit });
  const result = toNativeTypes(data.records);

  res.send(formatResponse(result, `User tagged in Content fetched`));
};
