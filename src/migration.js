/**
 * This file contains migrations to run every time the server is started.
 */
const { queryInstance } = require('./queries/query');

const queries = [
  async (s) => {
    await queryInstance.createConstraint({
      model: 'User',
      name: 'user_unique_id',
      property: 'id',
      constraint: 'IS UNIQUE',
      session: s,
    });
  },
  async (s) => {
    await queryInstance.createConstraint({
      model: 'User',
      name: 'user_unique_userName',
      property: 'userName',
      constraint: 'IS UNIQUE',
      session: s,
    });
  },
  async (s) => {
    await queryInstance.createConstraint({
      model: 'User',
      name: 'user_unique_email',
      property: 'id',
      constraint: 'IS UNIQUE',
      session: s,
    });
  },
  async (s) => {
    await queryInstance.createFullTextIndex({
      model: 'User',
      name: 'full_text_user_name_username_id',
      properties: ['name', 'userName', 'id'],
      session: s,
    });
  },
  async (s) => {
    await queryInstance.createConstraint({
      model: 'Genre',
      name: 'genre_unique_name',
      property: 'id',
      constraint: 'IS UNIQUE',
      session: s,
    });
  },
  async (s) => {
    await queryInstance.createConstraint({
      model: 'Poll',
      name: 'poll_unique_id',
      property: 'id',
      constraint: 'IS UNIQUE',
      session: s,
    });
  },
  async (s) => {
    await queryInstance.createConstraint({
      model: 'Active',
      name: 'active_poll_unique_id',
      property: 'id',
      constraint: 'IS UNIQUE',
      session: s,
    });
  },
  async (s) => {
    await queryInstance.createConstraint({
      model: 'Ended',
      name: 'Ended_poll_unique_id',
      property: 'id',
      constraint: 'IS UNIQUE',
      session: s,
    });
  },
  async (s) => {
    await queryInstance.createConstraint({
      model: 'Comment',
      name: 'comment_unique_id',
      property: 'id',
      constraint: 'IS UNIQUE',
      session: s,
    });
  },

  async (s) => {
    await queryInstance.createConstraint({
      model: 'Profile',
      name: 'profile_unique_id',
      property: 'id',
      constraint: 'IS UNIQUE',
      session: s,
    });
  },
  async (s) => {
    await queryInstance.createConstraint({
      model: 'Public',
      name: 'public_unique_id',
      property: 'id',
      constraint: 'IS UNIQUE',
      session: s,
    });
  },
  async (s) => {
    await queryInstance.createConstraint({
      model: 'Private',
      name: 'private_unique_id',
      property: 'id',
      constraint: 'IS UNIQUE',
      session: s,
    });
  },
  async (s) => {
    await queryInstance.createConstraint({
      model: 'Paid',
      name: 'paid_unique_id',
      property: 'id',
      constraint: 'IS UNIQUE',
      session: s,
    });
  },
  async (s) => {
    await queryInstance.createConstraint({
      model: 'Post',
      name: 'post_unique_id',
      property: 'id',
      constraint: 'IS UNIQUE',
      session: s,
    });
  },
  async (s) => {
    await queryInstance.createTextIndex({
      model: 'Post',
      name: 'post_description_index',
      property: 'description',
      session: s,
    });
  },
  async (s) => {
    await queryInstance.createConstraint({
      model: 'Review',
      name: 'review_unique_id',
      property: 'id',
      constraint: 'IS UNIQUE',
      session: s,
    });
  },
  async (s) => {
    await queryInstance.createFullTextIndex({
      model: 'Review',
      name: 'review_product_firm_name',
      properties: ['productName', 'productFirm'],
      session: s,
    });
  },
];

/**
 * Migrates database
 */
exports.migrate = async () => {
  await queryInstance.transaction(queries);
};
