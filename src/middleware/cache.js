const { formatResponse } = require('../utils/requests');
const { getCache } = require('../utils/redis');

/**
 * User Middleware for handling cached data.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 * @param {import('express').NextFunction} next Gives the controls for next middleware.
 */
exports.userCache = async (req, res, next) => {
  const { path } = req.route;
  const { method } = req.route.stack[0];
  const { id, name, page } = req.query;
  let cached;
  if (path === '/' && method === 'get') {
    cached = await getCache(`${id}userBy`);
  } else if (path === '/by-name' && method === 'get') {
    cached = await getCache(`usersBy${name}page${page}`);
  } else if (path === '/counts' && method === 'get') {
    cached = await getCache(`countsByUser${id}`);
  } else if (path === '/followers' && method === 'get') {
    cached = await getCache(`userRelatedInFOLLOWid${id}`);
  } else if (path === '/subscribers' && method === 'get') {
    cached = await getCache(`userRelatedInSUBSCRIBEid${id}`);
  } else if (path === '/following' && method === 'get') {
    cached = await getCache(`userRelatedOutFOLLOWid${id}`);
  }

  if (cached) res.send(formatResponse(cached, `user${path} from cache`));
  else next();
};

/**
 * Poll Middleware for handling cached data.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 * @param {import('express').NextFunction} next Gives the controls for next middleware.
 */
exports.pollCache = async (req, res, next) => {
  const { path } = req.route;
  const { method } = req.route.stack[0];
  const { id, page, genre, ownerId, viewerId } = req.query;
  let cached;

  if (path === '/me' && method === 'get') {
    cached = await getCache(`mePage${page}PollsBy${id}`);
  } else if (path === '/others' && method === 'get') {
    cached = await getCache(`PollsBy${ownerId}${viewerId}page${page}`);
  } else if (path === '/genre' && method === 'get') {
    cached = await getCache(`PollsBy${genre}${id}page${page}`);
  }

  if (cached) res.send(formatResponse(cached, `Poll${path} from cache`));
  else next();
};

/**
 * Post Middleware for handling cached data.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 * @param {import('express').NextFunction} next Gives the controls for next middleware.
 */
exports.postCache = async (req, res, next) => {
  const { path } = req.route;
  const { method } = req.route.stack[0];
  const { id, page, ownerId, viewerId, description } = req.query;
  let cached;

  if (path === '/user' && method === 'get') {
    cached = await getCache(
      `Page${page}PostsByOwner${ownerId}viewer${viewerId}`,
    );
  } else if (path === '/by-description' && method === 'get') {
    cached = await getCache(`Page${page}PostsByDesc${description}viewer${id}`);
  }

  if (cached) res.send(formatResponse(cached, `Post${path} from cache`));
  else next();
};

/**
 * Review Middleware for handling cached data.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 * @param {import('express').NextFunction} next Gives the controls for next middleware.
 */
exports.reviewCache = async (req, res, next) => {
  const { path } = req.route;
  const { method } = req.route.stack[0];
  const { id, page, ownerId, viewerId, name } = req.query;
  let cached;

  if (path === '/user' && method === 'get') {
    cached = await getCache(
      `Page${page}ReviewsByOwner${ownerId}viewer${viewerId}`,
    );
  } else if (path === '/name' && method === 'get') {
    cached = await getCache(`Page${page}ReviewsByName${name}viewer${id}`);
  }

  if (cached) res.send(formatResponse(cached, `Review${path} from cache`));
  else next();
};

/**
 * Comment Middleware for handling cached data.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 * @param {import('express').NextFunction} next Gives the controls for next middleware.
 */
exports.commentCache = async (req, res, next) => {
  const { path } = req.route;
  const { method } = req.route.stack[0];
  const { id, page } = req.query;
  let cached;

  if (path === '/' && method === 'get') {
    cached = await getCache(`CommentsBy${id}page${page}`);
  }

  if (cached) res.send(formatResponse(cached, 'Comments from cache'));
  else next();
};

/**
 * Feed Middleware for handling cached data.
 *
 * @param {import('express').Request} req Request object.
 * @param {import('express').Response} res Response object.
 * @param {import('express').NextFunction} next Gives the controls for next middleware.
 */
exports.feedCache = async (req, res, next) => {
  const { path } = req.route;
  const { method } = req.route.stack[0];
  const { id, page } = req.query;
  let cached;

  if (path === '/creator' && method === 'get') {
    cached = await getCache(`paidBy${id}Page${page}`);
  } else if (path === '/following' && method === 'get') {
    cached = await getCache(`feedFollowingPage${page}For${id}`);
  } else if (path === '/paid' && method === 'get') {
    cached = await getCache(`feedPaidPage${page}For${id}`);
  }

  if (cached) res.send(formatResponse(cached, `feed${path} from cache`));
  else next();
};
