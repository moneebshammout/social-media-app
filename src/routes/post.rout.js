const { AsyncRouter } = require('express-async-router');
const { getUpDownVotesCount, softDeleteEntity } = require('../service/api');
const {
  createPost,
  getPostsByUser,
  getPostsByDescription,
  repost,
  updatePost,
} = require('../service/post.service');
const {
  createSchema,
  postsByDescriptionSchema,
  repostSchema,
  updateSchema,
} = require('../validator/post-schema');
const { idSchema, viewerPagination } = require('../validator/schema-helpers');
const schemaValidator = require('../middleware/schema-validator');
const { postCache } = require('../middleware/cache');

const router = AsyncRouter();

router.post('/', createSchema, schemaValidator, createPost);
router.patch('/', updateSchema, schemaValidator, updatePost);
router.post('/repost', repostSchema, schemaValidator, repost);
router.delete('/', idSchema, schemaValidator, softDeleteEntity('Post'));
router.get(
  '/user',
  viewerPagination,
  schemaValidator,
  postCache,
  getPostsByUser,
);
router.get(
  '/by-description',
  postsByDescriptionSchema,
  schemaValidator,
  postCache,
  getPostsByDescription,
);
router.get('/counts', idSchema, schemaValidator, getUpDownVotesCount('Post'));

module.exports = router;
