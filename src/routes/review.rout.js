const { AsyncRouter } = require('express-async-router');
const { getUpDownVotesCount, softDeleteEntity } = require('../service/api');
const {
  createReview,
  getReviewsByUser,
  getReviewsByNames,
} = require('../service/review.service');

const {
  createSchema,
  reviewsByNamesSchema,
} = require('../validator/review-schema');

const { viewerPagination, idSchema } = require('../validator/schema-helpers');
const schemaValidator = require('../middleware/schema-validator');
const { reviewCache } = require('../middleware/cache');

const router = AsyncRouter();

router.post('/', createSchema, schemaValidator, createReview);
router.delete('/', idSchema, schemaValidator, softDeleteEntity('Review'));
router.get('/counts', idSchema, schemaValidator, getUpDownVotesCount('Review'));
router.get(
  '/user',
  viewerPagination,
  schemaValidator,
  reviewCache,
  getReviewsByUser,
);

router.get(
  '/name',
  reviewsByNamesSchema,
  schemaValidator,
  reviewCache,
  getReviewsByNames,
);

module.exports = router;
