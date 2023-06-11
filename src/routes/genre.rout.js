const { AsyncRouter } = require('express-async-router');
const { getGenreByName } = require('../service/genre.service');

const { namePagination } = require('../validator/schema-helpers');
const schemaValidator = require('../middleware/schema-validator');

const router = AsyncRouter();

router.get('/', namePagination, schemaValidator, getGenreByName);

module.exports = router;
