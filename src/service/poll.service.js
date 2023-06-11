const { Op } = require('neogma');
const { Poll } = require('../models');
const { inGenreCheck } = require('./api');
const { formatResponse } = require('../utils/requests');
const { currentDate } = require('../utils/date');
const PollQueries = require('../queries/poll.queries');
const { toNativeTypes } = require('../utils/requests');
const {
  saveTempCache,
  saveCache,
  deleteCacheByPattern,
} = require('../utils/redis');
const { pollsByGenreCache, pollsByOtherCache } = require('../constants');

/**
 * Create a poll in db.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.createPoll = async (req, res) => {
  const { id, data, genres } = req.body;
  const inGenre = await inGenreCheck(genres, 'poll_in_genre');

  await Promise.all([
    Poll.createOne(
      {
        id,
        ...data,
        createdDate: currentDate(),
        ...inGenre,
        create_poll: {
          where: {
            params: {
              id: { [Op.eq]: data.ownerId },
            },
          },
        },

        profile_poll_related: {
          where: {
            params: {
              id: { [Op.eq]: data.ownerId },
            },
          },
        },
      },
      {
        assertRelationshipsOfWhere: genres ? genres.length + 2 : 2,
      },
    ),
    deleteCacheByPattern(`mePage*PollsBy${data.ownerId}`),
  ]);
  res.send(formatResponse({}, 'Poll Created'));
};

/**
 * Ends a poll.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.endPoll = async (req, res) => {
  const { id, ownerId } = req.query;
  await Promise.all([
    PollQueries.endPoll(id),
    deleteCacheByPattern(`mePage*PollsBy${ownerId}`),
  ]);

  res.send(formatResponse({}, 'POLL ended'));
};

/**
 * Get random polls.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.getRandomPolls = async (req, res) => {
  const { id } = req.query;
  const result = await PollQueries.randomPolls(id);
  res.send(formatResponse(toNativeTypes(result.records), 'Polls fetched'));
};

/**
 * Get polls page for me.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.getPollsByMe = async (req, res) => {
  const { id, page, limit } = req.query;

  const data = await PollQueries.pollsByMe({ id, page, limit });
  const result = toNativeTypes(data.records);
  await saveCache({
    key: `mePage${page}PollsBy${id}`,
    value: result,
  });

  res.send(formatResponse(result, 'Polls fetched'));
};

/**
 * Get polls by others.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.getPollsByOthers = async (req, res) => {
  const { ownerId, viewerId, page, limit } = req.query;
  const data = await PollQueries.pollsByOthers({
    ownerId,
    viewerId,
    page,
    limit,
  });

  const result = toNativeTypes(data.records);
  await saveTempCache({
    key: `PollsBy${ownerId}${viewerId}page${page}`,
    seconds: pollsByOtherCache,
    value: result,
  });

  res.send(formatResponse(result, 'Polls fetched'));
};

/**
 * Get polls related to a genre.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.getPollsByGenre = async (req, res) => {
  const { id, genre, page, limit } = req.query;

  const data = await PollQueries.pollsByGenre({ id, genre, page, limit });
  const result = toNativeTypes(data.records);
  await saveTempCache({
    key: `PollsBy${genre}${id}page${page}`,
    seconds: pollsByGenreCache,
    value: result,
  });

  res.send(formatResponse(result, 'Polls fetched'));
};

/**
 * Get counts for a specific poll .
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.getPollCounts = async (req, res) => {
  const { id } = req.query;
  const result = await PollQueries.getPollCounts(id);
  res.send(formatResponse(toNativeTypes(result.records), 'Poll count fetched'));
};
