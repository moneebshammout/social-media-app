const { Op } = require('neogma');
const { Post } = require('../models');
const { inGenreCheck } = require('./api');

const { formatResponse } = require('../utils/requests');
const { currentDate } = require('../utils/date');
const PostQueries = require('../queries/post.queries');
const { toNativeTypes } = require('../utils/requests');
const { saveTempCache, deleteCacheByPattern } = require('../utils/redis');
const { postsByDescriptionCache, postsByUserCache } = require('../constants');

/**
 * Create a post in db.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.createPost = async (req, res) => {
  const { id, data, genres, paid } = req.body;
  const inGenre = await inGenreCheck(genres, 'post_in_genre');

  const relatedRelation = paid
    ? {
        paid_post_related: {
          where: {
            params: {
              id: { [Op.eq]: data.ownerId },
            },
          },
        },
      }
    : {
        profile_post_related: {
          where: {
            params: {
              id: { [Op.eq]: data.ownerId },
            },
          },
        },
      };

  await Promise.all([
    Post.createOne(
      {
        id,
        ...data,
        media: JSON.stringify(data.media),
        history: [],
        createdDate: currentDate(),
        create_post: {
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
    paid
      ? deleteCacheByPattern(`paidBy${data.ownerId}Page*`)
      : deleteCacheByPattern(`Page*PostsByOwner${data.ownerId}viewer*`),
  ]);

  res.send(formatResponse({}, 'Post Created'));
};

/**
 * Get posts by others.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.getPostsByUser = async (req, res) => {
  const { ownerId, viewerId, page, limit } = req.query;

  const data = await PostQueries.postsByUser({
    ownerId,
    viewerId,
    page,
    limit,
  });

  const result = toNativeTypes(data.records);
  await saveTempCache({
    key: `Page${page}PostsByOwner${ownerId}viewer${viewerId}`,
    seconds: postsByUserCache,
    value: result,
  });

  res.send(formatResponse(result, 'posts fetched'));
};

/**
 * Get post by description.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.getPostsByDescription = async (req, res) => {
  const { id, description, page, limit } = req.query;

  const data = await PostQueries.postsByDescription({
    id,
    description,
    page,
    limit,
  });
  const result = toNativeTypes(data.records);
  await saveTempCache({
    key: `Page${page}PostsByDesc${description}viewer${id}`,
    seconds: postsByDescriptionCache,
    value: result,
  });
  res.send(formatResponse(result, 'Posts fetched'));
};

/**
 * Repost in user timeline.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.repost = async (req, res) => {
  const { userId, postId, repostId, description } = req.body;
  await Promise.all([
    deleteCacheByPattern(`Page*PostsByOwner${userId}viewer*`),
    PostQueries.rePost({ userId, postId, repostId, description }),
  ]);

  res.send(formatResponse({}, 'Repost done'));
};

/**
 * Update post text.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.updatePost = async (req, res) => {
  const { id, description } = req.body;
  await PostQueries.updatePost({ id, description });
  res.send(formatResponse({}, 'Post Updated'));
};
