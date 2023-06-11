const { ModelFactory } = require('neogma');

/**
 * This model will hold all the content that are in user profile.
 */
module.exports = (neogma) => {
  const Profile = ModelFactory(
    {
      label: 'Profile',
      schema: {
        id: {
          type: 'string',
          required: true,
        },
        bio: {
          type: 'string',
        },
        imageId: {
          type: 'string',
        },
        imageHistory: {
          type: 'array',
        },
        coverHistory: {
          type: 'array',
        },
        primaryKeyField: 'id',
      },
    },
    neogma,
  );

  /**
   * Create a profile in db and giving it public label.
   *
   * @param {Object} data  Data to be created.
   *
   * @returns {Promise<Profile>} Created profile.
   */
  Profile.createProfile = async (data) => {
    // eslint-disable-next-line global-require
    const UserQueries = require('../queries/user.queries');
    const session = await UserQueries.driver.session();
    const profile = await Profile.createOne(data, {
      merge: true,
      session,
    });
    profile.labels = ['Profile', 'Public'];
    await UserQueries.changeProfileState(data.id, session);
    return profile;
  };

  return Profile;
};
