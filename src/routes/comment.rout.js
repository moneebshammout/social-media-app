const { AsyncRouter } = require('express-async-router');
const {
  createComment,
  getComments,
  updateComment,
} = require('../service/comment.service');

const {
  createSchema,
  updateSchema,
  getSchema,
} = require('../validator/comment-schema');

const { idSchema } = require('../validator/schema-helpers');
const { softDeleteEntity } = require('../service/api');
const { commentCache } = require('../middleware/cache');
const schemaValidator = require('../middleware/schema-validator');

const router = AsyncRouter();

router.post('/', createSchema, schemaValidator, createComment);
router.patch('/', updateSchema, schemaValidator, updateComment);
router.delete('/', idSchema, schemaValidator, softDeleteEntity('Comment'));
router.get('/', getSchema, schemaValidator, commentCache, getComments);

module.exports = router;
