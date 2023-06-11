const { AsyncRouter } = require('express-async-router');
const {
  createPoll,
  endPoll,
  getRandomPolls,
  getPollsByMe,
  getPollsByOthers,
  getPollsByGenre,
  getPollCounts,
} = require('../service/poll.service');

const {
  createSchema,
  pollsByGenreSchema,
  endPollSchema,
} = require('../validator/poll-schema');

const { pollCache } = require('../middleware/cache');
const schemaValidator = require('../middleware/schema-validator');
const {
  idSchema,
  viewerPagination,
  pagination,
} = require('../validator/schema-helpers');
const { softDeleteEntity } = require('../service/api');

const router = AsyncRouter();

router.post('/', createSchema, schemaValidator, createPoll);
router.patch('/', endPollSchema, schemaValidator, endPoll);
router.delete('/', idSchema, schemaValidator, softDeleteEntity('Poll'));
router.get('/', idSchema, schemaValidator, getRandomPolls);
router.get('/me', pagination, schemaValidator, pollCache, getPollsByMe);
router.get('/counts', idSchema, schemaValidator, getPollCounts);
router.get(
  '/others',
  viewerPagination,
  schemaValidator,
  pollCache,
  getPollsByOthers,
);

router.get(
  '/genre',
  pollsByGenreSchema,
  schemaValidator,
  pollCache,
  getPollsByGenre,
);

module.exports = router;
