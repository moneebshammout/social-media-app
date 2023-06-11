const { AsyncRouter } = require('express-async-router');
const usersRouter = require('./user.rout');
const pollRouter = require('./poll.rout');
const commentRouter = require('./comment.rout');
const postRouter = require('./post.rout');
const reviewRouter = require('./review.rout');
const feedRouter = require('./feed.rout');
const genreRouter = require('./genre.rout');

const router = AsyncRouter();

router.use('/user', usersRouter);
router.use('/poll', pollRouter);
router.use('/comment', commentRouter);
router.use('/review', reviewRouter);
router.use('/post', postRouter);
router.use('/feed', feedRouter);
router.use('/genre', genreRouter);

module.exports = router;
