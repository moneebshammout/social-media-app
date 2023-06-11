const { Op } = require('neogma');
const { currentDate } = require('../utils/date');
const { Review } = require('../models');
const { formatResponse, toNativeTypes } = require('../utils/requests');
const ReviewQueries = require('../queries/review.queries');
const { saveTempCache, deleteCacheByPattern } = require('../utils/redis');
const { reviewsByNameCache, reviewsByUserCache } = require('../constants');
const { inGenreCheck } = require('./api');

/**
 * Create Review in db.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.createReview = async (req, res) => {
  const { id, data, genres, paid } = req.body;
  const inGenre = await inGenreCheck(genres, 'review_in_genre');
  const relatedRelation = paid
    ? {
        paid_review_related: {
          where: {
            params: {
              id: { [Op.eq]: data.ownerId },
            },
          },
        },
      }
    : {
        profile_review_related: {
          where: {
            params: {
              id: { [Op.eq]: data.ownerId },
            },
          },
        },
      };

  await Promise.all([
    Review.createOne(
      {
        id,
        ...data,
        media: JSON.stringify(data.media),
        rate: ReviewQueries.int(data.rate),
        createdDate: currentDate(),
        create_review: {
          where: {
            params: {
              id: { [Op.eq]: data.ownerId },
            },
          },
        },
        ...inGenre,
        ...relatedRelation,
      },
      {
        assertRelationshipsOfWhere: genres ? genres.length + 2 : 2,
      },
    ),
    deleteCacheByPattern(`Page*ReviewsByOwner${data.ownerId}viewer*`),
  ]);

  res.send(formatResponse({}, 'Review Created'));
};

/**
 * Get reviews by users.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.getReviewsByUser = async (req, res) => {
  const { ownerId, viewerId, page, limit } = req.query;

  const data = await ReviewQueries.reviewsByUser({
    ownerId,
    viewerId,
    page,
    limit,
  });

  const result = toNativeTypes(data.records);
  await saveTempCache({
    key: `Page${page}ReviewsByOwner${ownerId}viewer${viewerId}`,
    seconds: reviewsByUserCache,
    value: result,
  });

  res.send(formatResponse(result, 'Reviews fetched'));
};

/**
 * Get review by product name or firm name.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.getReviewsByNames = async (req, res) => {
  const { id, name, page, limit } = req.query;

  const data = await ReviewQueries.getReviewByName({ id, name, page, limit });
  const result = toNativeTypes(data.records);
  await saveTempCache({
    key: `Page${page}ReviewsByName${name}viewer${id}`,
    seconds: reviewsByNameCache,
    value: result,
  });

  res.send(formatResponse(result, 'Reviews fetched'));
};
