/**
 * Redis expiry date cache in seconds.
 *
 */
exports.userByNameCache = 1800;
exports.countsByUserCache = 1800;
exports.userRelatedCache = 1800;
exports.pollsByOtherCache = 300;
exports.pollsByGenreCache = 300;
exports.postsByUserCache = 60;
exports.postsByDescriptionCache = 300;
exports.reviewsByUserCache = 300;
exports.reviewsByNameCache = 60;
exports.commentsCache = 300;
exports.paidByMeCache = 1800;
exports.feedCache = 300;

/**
 * indexes
 */
exports.indexes = {
  fullText: 'full_text_user_name_username_id',
};
