const { AsyncRouter } = require('express-async-router');
const {
  createUser,
  updateUser,
  getUser,
  getUserByName,
  getUserCounts,
  changeProfileState,
  authorizeProfileView,
  getUserRelatedInUsers,
  getUserRelatedOutUsers,
  getUserByUserName,
  tagUsers,
} = require('../service/user.service');

const { createRelationShip, deleteRelationShip } = require('../service/api');
const {
  createSchema,
  updateSchema,
  createRelationSchema,
  deleteRelationSchema,
  usersByNameSchema,
  authorizeViewSchema,
  usersByUserNameSchema,
  tagSchema,
} = require('../validator/user-schema');

const { userCache } = require('../middleware/cache');
const schemaValidator = require('../middleware/schema-validator');
const { idSchema, pagination } = require('../validator/schema-helpers');
const { User } = require('../models');

const router = AsyncRouter();

router.get('/', idSchema, schemaValidator, userCache, getUser);
router.get('/counts', idSchema, schemaValidator, userCache, getUserCounts);
router.get(
  '/name',
  usersByNameSchema,
  schemaValidator,
  userCache,
  getUserByName,
);

router.get(
  '/user_name',
  usersByUserNameSchema,
  schemaValidator,
  getUserByUserName,
);

router.get(
  '/followers',
  pagination,
  schemaValidator,
  userCache,
  getUserRelatedInUsers('FOLLOW'),
);

router.get(
  '/subscribers',
  pagination,
  schemaValidator,
  userCache,
  getUserRelatedInUsers('SUBSCRIBE'),
);

router.get(
  '/following',
  pagination,
  schemaValidator,
  userCache,
  getUserRelatedOutUsers('FOLLOW'),
);

router.get(
  '/authorize-view',
  authorizeViewSchema,
  schemaValidator,
  authorizeProfileView,
);

router.post('/', createSchema, schemaValidator, createUser);
router.post(
  '/relation',
  createRelationSchema,
  schemaValidator,
  createRelationShip(User),
);

router.patch('/', updateSchema, schemaValidator, updateUser);
router.patch('/profile', idSchema, schemaValidator, changeProfileState);
router.delete(
  '/relation',
  deleteRelationSchema,
  schemaValidator,
  deleteRelationShip(User),
);

router.post('/tag', tagSchema, schemaValidator, tagUsers);
module.exports = router;
