const { Op, neo4jDriver } = require('neogma');
const { User, Genre, Profile, Paid } = require('../models');
const { formatResponse, toNativeTypes } = require('../utils/requests');
const { saveTempCache } = require('../utils/redis');
const {
  userByNameCache,
  countsByUserCache,
  userRelatedCache,
} = require('../constants');
const UserQueries = require('../queries/user.queries');

const { int } = neo4jDriver;

/**
 * Create User in db.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.createUser = async (req, res) => {
  const { id, data, profile, interests } = req.body;

  await Promise.all([
    Profile.createProfile({ id, ...profile }),
    Paid.createOne({ id }, { merge: true }),
    interests &&
      Genre.createMany(
        interests.map((g) => ({ name: g })),
        { merge: true },
      ),
  ]);

  await User.createOne(
    {
      id,
      ...data,
      totalLike: int(0),
      totalDislike: int(0),
      interested: {
        where: {
          params: {
            name: {
              [Op.in]: interests,
            },
          },
        },
      },
      profile_content_in: {
        where: {
          params: {
            id: { [Op.eq]: id },
          },
        },
      },
      paid_content_in: {
        where: {
          params: {
            id: { [Op.eq]: id },
          },
        },
      },
    },
    {
      assertRelationshipsOfWhere: interests.length + 2,
    },
  );

  res.send(formatResponse({}, 'User Created'));
};

/**
 * Update User in db.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.updateUser = async (req, res) => {
  const { id, user, profile } = req.body;

  await Promise.allSettled([
    User.update(user, {
      where: {
        id,
      },
    }),
    Profile.update(profile, {
      where: {
        id,
      },
    }),
  ]);

  res.send(formatResponse({}, 'User Updated'));
};

/**
 * Get user by id.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.getUser = async (req, res) => {
  const { id } = req.query;
  const result = await UserQueries.getOneById(id);

  res.send(
    formatResponse(toNativeTypes(result.records) ?? {}, 'User Retrieved'),
  );
};

/**
 * Get user by name or username.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.getUserByName = async (req, res) => {
  const { name, page, limit } = req.query;

  const data = await UserQueries.getUserByName({ name, page, limit });
  const result = toNativeTypes(data.records);
  await saveTempCache({
    key: `usersBy${name}page${page}`,
    seconds: userByNameCache,
    value: result,
  });

  res.send(formatResponse(result, 'Users fetched'));
};

/**
 * Get users by username.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.getUserByUserName = async (req, res) => {
  const { userName, page, limit } = req.query;

  const data = await UserQueries.getByUserName({ userName, page, limit });
  const result = data.records.length ? toNativeTypes(data.records) : {};

  res.send(formatResponse(result, 'By userName'));
};

/**
 * Get followers and followed counts and subscriber counts.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.getUserCounts = async (req, res) => {
  const { id } = req.query;

  const data = await UserQueries.getUserCounts(id);
  const result = toNativeTypes(data.records);
  await saveTempCache({
    key: `countsByUser${id}`,
    seconds: countsByUserCache,
    value: result,
  });

  res.send(formatResponse(result, 'counts fetched'));
};

/**
 * Change profile state from public to private and vice versa.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.changeProfileState = async (req, res) => {
  const { id } = req.query;
  await UserQueries.changeProfileState(id);
  res.send(formatResponse({}, 'Profile state changed'));
};

/**
 * Authorize user view others profile by checking
 * if he is subscribed or followed and if the profile is public or not.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.authorizeProfileView = async (req, res) => {
  const { viewerId, ownerId } = req.query;
  const result = await UserQueries.authorizeProfileView(viewerId, ownerId);
  res.send(
    formatResponse(
      toNativeTypes(result.records),
      'Profile Authorizing fetched',
    ),
  );
};

/**
 * Get users related to a user example followers or subscribers.
 *
 * @param {string} relation Relation type.
 *
 * @return {Promise} Rout handler.
 */
exports.getUserRelatedInUsers =
  (relation) =>
  /**
   * Get users ---> user.
   *
   * @param {import('express').Request} req Request object.
   * @param {import('express').Response} res Response object.
   */
  async (req, res) => {
    const { id, page, search, limit } = req.query;
    const data = await UserQueries.getRelationsInUser({
      id,
      relation,
      page,
      search,
      limit,
    });

    const result = toNativeTypes(data.records);
    await saveTempCache({
      key: `userRelatedIn${relation}id${id}`,
      seconds: userRelatedCache,
      value: result,
    });

    res.send(formatResponse(result, `Users in ${relation} fetched`));
  };

/**
 * Get users that a user is related to  example following.
 *
 * @param {string} relation Relation type.
 *
 * @return {Promise} Rout handler.
 */
exports.getUserRelatedOutUsers =
  (relation) =>
  /**
   * Get users <--- user.
   *
   * @param {import('express').Request} req Request object.
   * @param {import('express').Response} res Response object.
   */
  async (req, res) => {
    const { id, page, search, limit } = req.query;
    const data = await UserQueries.getRelationsOutUser({
      id,
      relation,
      search,
      page,
      limit,
    });

    const result = toNativeTypes(data.records);
    await saveTempCache({
      key: `userRelatedOut${relation}id${id}`,
      seconds: userRelatedCache,
      value: result,
    });

    res.send(formatResponse(result, `Users out ${relation} fetched`));
  };

/**
 * Create tagged_In relation and return their user ids.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 */
exports.tagUsers = async (req, res) => {
  const { entity, entityId, userNames } = req.body;
  const result = await UserQueries.tagUsers({ entity, entityId, userNames });
  res.send(
    formatResponse(toNativeTypes(result.records), `users has been tagged`),
  );
};
