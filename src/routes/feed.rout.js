const { AsyncRouter } = require('express-async-router');
const {
  getFeed,
  getUserPaidContent,
  getUserContent,
  getTaggedInContent,
} = require('../service/feed.service');
const { pagination } = require('../validator/schema-helpers');
const schemaValidator = require('../middleware/schema-validator');
const { feedCache } = require('../middleware/cache');

const router = AsyncRouter();

router.get(
  '/following',
  pagination,
  schemaValidator,
  feedCache,
  getFeed('Following'),
);

router.get('/paid', pagination, schemaValidator, feedCache, getFeed('Paid'));
router.get(
  '/user-paid',
  pagination,
  schemaValidator,
  feedCache,
  getUserPaidContent,
);
router.get('/user-content', pagination, schemaValidator, getUserContent);
router.get('/tagged', pagination, schemaValidator, getTaggedInContent);

module.exports = router;
