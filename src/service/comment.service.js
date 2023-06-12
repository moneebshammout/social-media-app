const { Op } = require('neogma');
const { Comment } = require('../models');
const { formatResponse, toNativeTypes } = require('../utils/requests');
const { currentDate } = require('../utils/date');
const CommentQueries = require('../queries/comment.queries');
const { saveTempCache } = require('../utils/redis');
const { commentsCache } = require('../constants');

/**
 * Create comment.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.createComment = async (req, res) => {
  const { id, data, entity, entityId } = req.body;
  const relatedRelation = {
    ...(entity === 'Poll' && {
      poll_related_to: {
        where: {
          params: {
            id: { [Op.eq]: entityId },
          },
        },
      },
    }),
    ...(entity === 'Post' && {
      post_related_to: {
        where: {
          params: {
            id: { [Op.eq]: entityId },
          },
        },
      },
    }),
    ...(entity === 'Comment' && {
      reply: {
        where: {
          params: {
            id: { [Op.eq]: entityId },
          },
        },
      },
    }),
  };

  await Comment.createOne(
    {
      id,
      ...data,
      createdDate: currentDate(),
      history: [],
      create_comment: {
        where: {
          params: {
            id: {
              [Op.eq]: data.ownerId,
            },
          },
        },
      },

      ...relatedRelation,
    },

    {
      assertRelationshipsOfWhere: 2,
    },
  );

  res.send(formatResponse({}, 'Comment Created'));
};

/**
 * Get Comments for a specific content.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.getComments = async (req, res) => {
  const { id, entity, page, limit } = req.query;

  const data = await CommentQueries.getComments({ id, entity, page, limit });
  const result = toNativeTypes(data.records);
  await saveTempCache({
    key: `CommentsBy${id}page${page}`,
    seconds: commentsCache,
    value: result,
  });

  res.send(formatResponse(result, 'Comments fetched'));
};

/**
 * Update comment.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.updateComment = async (req, res) => {
  const { id, comment } = req.body;
  await CommentQueries.updateComment({ id, comment });
  res.send(formatResponse({}, 'Comment Updated'));
};
