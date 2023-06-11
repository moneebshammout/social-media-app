/* eslint-disable no-console */
/* eslint-disable object-curly-newline */
const { Neogma } = require('neogma');
const { isDevEnv } = require('../utils/environment');

const { DB_URI, DB_USERNAME, DB_PASSWORD } = process.env;

/**
 * Create single neogma instance passed to all models.
 */
const neogma = new Neogma(
  {
    url: DB_URI,
    username: DB_USERNAME,
    password: DB_PASSWORD,
  },
  {
    logger: isDevEnv() && console.log,
    disableLosslessIntegers: true,
    
  },
);

/**
 * Creating all models.
 */
const User = require('./user')(neogma);
const Profile = require('./profile')(neogma);
const Paid = require('./paid')(neogma);
const Genre = require('./genre')(neogma);
const Poll = require('./poll')(neogma);
const Comment = require('./comment')(neogma);
const Review = require('./review')(neogma);
const Post = require('./post')(neogma);

/**
 * Assigning relations to all models.
 */
User.addRelationships({
  profile_content_in: {
    model: Profile,
    direction: 'out',
    name: 'CONTENT_IN',
  },
  paid_content_in: {
    model: Paid,
    direction: 'out',
    name: 'CONTENT_IN',
  },
  follow: {
    model: 'self',
    direction: 'out',
    name: 'FOLLOW',
  },
  subscribe: {
    model: 'self',
    direction: 'out',
    name: 'SUBSCRIBE',
  },
  interested: {
    model: Genre,
    direction: 'out',
    name: 'INTERESTED_IN',
  },
  create_poll: {
    model: Poll,
    direction: 'out',
    name: 'CREATE',
  },
  like: {
    model: Poll,
    direction: 'out',
    name: 'LIKE',
  },
  right_like: {
    model: Poll,
    direction: 'out',
    name: 'RIGHT_LIKE',
  },
  left_like: {
    model: Poll,
    direction: 'out',
    name: 'LEFT_LIKE',
  },
  dis_like: {
    model: Poll,
    direction: 'out',
    name: 'DISLIKE',
  },
  un_certain: {
    model: Poll,
    direction: 'out',
    name: 'UNCERTAIN',
  },
  create_comment: {
    model: Comment,
    direction: 'out',
    name: 'CREATE',
  },
  create_review: {
    model: Review,
    direction: 'out',
    name: 'CREATE',
  },
  create_post: {
    model: Post,
    direction: 'out',
    name: 'CREATE',
  },
  post_up_vote: {
    model: Post,
    direction: 'out',
    name: 'UP_VOTE',
  },
  post_down_vote: {
    model: Post,
    direction: 'out',
    name: 'DOWN_VOTE',
  },
  review_up_vote: {
    model: Review,
    direction: 'out',
    name: 'UP_VOTE',
  },
  review_down_vote: {
    model: Review,
    direction: 'out',
    name: 'DOWN_VOTE',
  },
});

Profile.addRelationships({
  profile_content_in: {
    model: User,
    direction: 'in',
    name: 'CONTENT_IN',
  },

  profile_post_related: {
    model: Post,
    direction: 'in',
    name: 'RELATED_TO',
  },
  profile_poll_related: {
    model: Poll,
    direction: 'in',
    name: 'RELATED_TO',
  },
  profile_review_related: {
    model: Review,
    direction: 'in',
    name: 'RELATED_TO',
  },
});

Paid.addRelationships({
  paid_content_in: {
    model: User,
    direction: 'in',
    name: 'CONTENT_IN',
  },
  paid_post_related: {
    model: Post,
    direction: 'in',
    name: 'RELATED_TO',
  },
  paid_review_related: {
    model: Review,
    direction: 'in',
    name: 'RELATED_TO',
  },
});

Genre.addRelationships({
  interested: {
    model: User,
    direction: 'in',
    name: 'INTERESTED_IN',
  },
  poll_in_genre: {
    model: Poll,
    direction: 'in',
    name: 'IN_GENRE',
  },
  post_in_genre: {
    model: Post,
    direction: 'in',
    name: 'IN_GENRE',
  },
  review_in_genre: {
    model: Review,
    direction: 'in',
    name: 'IN_GENRE',
  },
});

Poll.addRelationships({
  poll_in_genre: {
    model: Genre,
    direction: 'out',
    name: 'IN_GENRE',
  },
  profile_poll_related: {
    model: Profile,
    direction: 'out',
    name: 'RELATED_TO',
  },
  create_poll: {
    model: User,
    direction: 'in',
    name: 'CREATE',
  },
  like: {
    model: User,
    direction: 'in',
    name: 'LIKE',
  },
  right_like: {
    model: User,
    direction: 'in',
    name: 'RIGHT_LIKE',
  },
  left_like: {
    model: User,
    direction: 'in',
    name: 'LEFT_LIKE',
  },
  dis_like: {
    model: User,
    direction: 'in',
    name: 'DISLIKE',
  },
  un_certain: {
    model: User,
    direction: 'in',
    name: 'UNCERTAIN',
  },
  poll_related_to: {
    model: Comment,
    direction: 'in',
    name: 'RELATED_TO',
  },
});

Post.addRelationships({
  post_in_genre: {
    model: Genre,
    direction: 'out',
    name: 'IN_GENRE',
  },
  create_post: {
    model: User,
    direction: 'in',
    name: 'CREATE',
  },
  profile_post_related: {
    model: Profile,
    direction: 'out',
    name: 'RELATED_TO',
  },

  paid_post_related: {
    model: Paid,
    direction: 'out',
    name: 'RELATED_TO',
  },
  post_up_vote: {
    model: User,
    direction: 'in',
    name: 'UP_VOTE',
  },
  post_down_vote: {
    model: User,
    direction: 'in',
    name: 'DOWN_VOTE',
  },
  post_related_to: {
    model: Comment,
    direction: 'in',
    name: 'RELATED_TO',
  },
});

Comment.addRelationships({
  create_comment: {
    model: User,
    direction: 'in',
    name: 'CREATE',
  },
  reply: {
    model: 'self',
    direction: 'out',
    name: 'RELATED_TO',
  },
  poll_related_to: {
    model: Poll,
    direction: 'out',
    name: 'RELATED_TO',
  },
  post_related_to: {
    model: Post,
    direction: 'out',
    name: 'RELATED_TO',
  },
});

Review.addRelationships({
  create_review: {
    model: User,
    direction: 'in',
    name: 'CREATE',
  },
  profile_review_related: {
    model: Profile,
    direction: 'out',
    name: 'RELATED_TO',
  },
  paid_review_related: {
    model: Paid,
    direction: 'out',
    name: 'RELATED_TO',
  },
  review_up_vote: {
    model: User,
    direction: 'in',
    name: 'UP_VOTE',
  },
  review_down_vote: {
    model: User,
    direction: 'in',
    name: 'DOWN_VOTE',
  },
  review_in_genre: {
    model: Genre,
    direction: 'out',
    name: 'IN_GENRE',
  },
});

module.exports = {
  neogma,
  User,
  Profile,
  Paid,
  Genre,
  Poll,
  Comment,
  Review,
  Post,
};
