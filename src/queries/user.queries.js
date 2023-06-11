/* eslint-disable no-underscore-dangle */
const { Query } = require('./query');
const { indexes } = require('../constants');

class UserQueries extends Query {
  /**
   * Gets user by id and profile.
   *
   * @param {string} id User id.
   *
   * @return {Promise<QueryResult>}
   */
  async getOneById(id) {
    return this.runner.run(
      `
      MATCH (user:User {id:$id}),(profile:Profile {id:$id})
      with labels(profile)as profileLabels,user,profile
      return 
      user{.*},
      profile{.*,state:CASE WHEN 'Public' IN profileLabels THEN 'Public' ELSE 'Private' END}
      `,
      { id },
    );
  }

  /**
   * Gets users by user name
   * if limit is 1 it checks for exact.
   * else it fetches a page .
   *
   * @param {object} params Parameter object.
   * @param {string} params.id User id.
   * @param {number} params.page Page number.
   * @param {number?} params.limit Page size.
   *
   * @return {Promise<QueryResult>}
   */
  async getByUserName({ userName, page, limit = 10 }) {
    if (limit === '1') {
      return this.runner.run(
        `
        MATCH (user:User {userName:$userName})
        with user 
        MATCH (profile:Profile {id:user.id})
        with user,profile
        RETURN 
        user.userName as userName,
        user.id as id,
        profile.imageId as imageId
        `,
        {
          userName,
        },
      );
    }

    return this.runner.run(
      `
      MATCH (user:User )
      WHERE user.userName STARTS WITH $userName
      with user SKIP $skip LIMIT $limit
      MATCH (profile:Profile {id:user.id})
      with user,profile
      RETURN 
      user.userName as userName,
      user.id as id,
      profile.imageId as imageId
      `,
      { userName, skip: this.int((page - 1) * limit), limit: this.int(limit) },
    );
  }

  /**
   * Change profile state from public to private and vice versa.
   *
   * @param {string} id User id.
   *
   * @return {Promise<QueryResult>}
   */
  async changeProfileState(id, session = null) {
    this.runner.run(
      `
      MATCH(profile:Profile {id:$id})
      with apoc.label.exists(profile, "Public") as isPublic,profile
      CALL apoc.do.when(isPublic,
        'REMOVE profile:Public SET profile:Private RETURN profile',
        'REMOVE profile:Private SET profile:Public RETURN profile',
        {profile:profile}
      )YIELD value RETURN "Done"
      `,
      { id },
      session,
    );
  }

  /**
   * Checks if user is following and subscribing user
   * also checks user profile public or private.
   *
   * @param {string} viewerId
   * @param {string} ownerId
   *
   * @return {Promise<QueryResult>}
   */
  async authorizeProfileView(viewerId, ownerId) {
    return this.runner.run(
      `
       MATCH
      (viewer:User {id:$viewerId}),
      (owner:User {id:$ownerId}),
      (profile:Profile {id:$ownerId})
      RETURN 
      apoc.nodes.connected(viewer, owner,"FOLLOW>") as followed,
      apoc.nodes.connected(viewer, owner, "SUBSCRIBE>") as subscribed,
      apoc.label.exists(profile, "Public") as isPublic
      `,
      { viewerId, ownerId },
    );
  }

  /**
   * Fetches users by name or username.
   * Uses Full-text indexes from  Apache Lucene in neo4j for fast searching.
   *
   * @param {object} params Parameter object.
   * @param {string} params.name Users name.
   * @param {number} params.page Page number.
   * @param {number?} params.limit Page size.
   *
   * @return {Promise<QueryResult>}
   */
  async getUserByName({ name, page, limit = 10 }) {
    return this.runner.run(
      `
        CALL db.index.fulltext.queryNodes(${indexes.fullText},$name) YIELD node
        WITH node SKIP $skip LIMIT $limit
        MATCH (node)-[:CONTENT_IN]->(profile:Profile)
        RETURN
        node.id as id,
        node.name as name,
        profile.imageId as imageId
        `,
      {
        name: `*${name}*`,
        skip: this.int((page - 1) * limit),
        limit: this.int(limit),
      },
    );
  }

  /**
   * Get followers Count and followed count and subscribers count for a user.
   *
   * @param {string } id User id.
   *
   * @return {Promise<QueryResult>}
   */
  async getUserCounts(id) {
    return this.runner.run(
      `
      MATCH(user:User {id:$id})
      RETURN 
      size( [ ()-[:FOLLOW]->(user) | user]  ) as followersCount,
      size( [ ()-[:SUBSCRIBE]->(user) | user]  ) as subscribersCount,
      size( [ (user)-[:FOLLOW]->() | user]  ) as followedCount
      `,
      { id },
    );
  }

  /**
   * Helper function for fetching users related based on directions and search query.
   *
   * @param {object} params Parameter object.
   * @param {string} params.id User Id.
   * @param {string} params.relation Relation name.
   * @param {number} params.page Page count.
   * @param {string} params.search Search query.
   * @param {number?} params.limit Page size.
   *
   * @return {Promise<QueryResult>}
   *
   */
  async _getRelatedUsers({
    id,
    relation,
    page,
    direction,
    search = '',
    limit = 10,
  }) {
    const relationString =
      direction === 'out' ? `-[:${relation}]->` : `<-[:${relation}]-`;
    const isFollow = relation === 'FOLLOW' && direction === 'out';

    if (search) {
      return this.runner.run(
        `
          MATCH (user:User {id:$id})${relationString}(users:User)
          WITH collect (users.id) AS usersList,user
          WITH "(" + apoc.text.join(usersList, ' OR ') + ")^2" AS queryPart,usersList,user
          CALL apoc.do.when(size(usersList) > 0, 
          "CALL db.index.fulltext.queryNodes($index,$search +' AND  id:' + $queryPart)
              YIELD node
              WITH node SKIP $skip LIMIT $limit
              MATCH (node)-[:CONTENT_IN]->(profile:Profile)
              RETURN
              node.id as id,
              node.name as name,
              node.userName as userName,
              profile.imageId as imageId,
              node,
              $user
          ", 
          "RETURN NULL", {queryPart:queryPart,search:$search,index:$index,skip:$skip,limit:$limit,user:user}) 
          YIELD value
          WITH value WHERE value.id IS NOT NULL 
          RETURN 
          value.imageId as imageId,
          value.name as name,
          value.id as id,
          value.userName as userName,
          CASE WHEN $isFollow 
              THEN true 
              ELSE apoc.nodes.connected(value.user, value.node,"FOLLOW>")
          END AS followed

          `,
        {
          id,
          skip: this.int((page - 1) * limit),
          limit: this.int(limit),
          search: `*${search}*`,
          index: indexes.fullText,
          isFollow,
        },
      );
    }
    return this.runner.run(
      `
        MATCH (user:User {id:$id})${relationString}(users:User)
        WITH user,users SKIP $skip LIMIT $limit
        MATCH (users)-[:CONTENT_IN]->(profile:Profile)
        RETURN
        users.id as id,
        users.name as name,
        profile.imageId as imageId,
        users.userName as userName,
        CASE WHEN $isFollow 
              THEN true 
              ELSE apoc.nodes.connected(user, users,"FOLLOW>")
          END AS followed
        `,
      {
        id,
        skip: this.int((page - 1) * limit),
        limit: this.int(limit),
        isFollow,
      },
    );
  }

  /**
   * Get users related to a user (user)<-[relations]-(users).
   *
   * @param {object} params Parameter object.
   * @param {string} params.id User Id.
   * @param {string} params.relation Relation name.
   * @param {number} params.page Page count.
   * @param {string} params.search Search query.
   * @param {number?} params.limit Page size.
   *
   * @return {Promise<QueryResult>}
   */
  async getRelationsInUser({ id, relation, page, search = '', limit = 10 }) {
    return this._getRelatedUsers({
      id,
      relation,
      page,
      direction: 'in',
      search,
      limit,
    });
  }

  /**
   * Get users that a user is related to them (user)-[relations]->(users).
   *
   * @param {object} params Parameter object.
   * @param {string} params.id User Id.
   * @param {string} params.relation Relation name.
   * @param {number} params.page Page count.
   * @param {string} params.search Search query.
   * @param {number?} params.limit Page size.
   *
   * @return {Promise<QueryResult>}
   */
  async getRelationsOutUser({ id, relation, page, search = '', limit = 10 }) {
    return this._getRelatedUsers({
      id,
      relation,
      page,
      direction: 'out',
      search,
      limit,
    });
  }

  /**
   * Tags users in a content and returns their IDS.
   *
   * @param {object} params Parameter object.
   * @param {Array<string>} params.userNames User Id.
   * @param {Array<string>} params.entity Entity name ex:post,poll,review.
   * @param {Array<string>} params.entityId Entity Id.
   *
   * @return {Promise<QueryResult>}
   */
  async tagUsers({ userNames, entity, entityId }) {
    return this.runner.run(
      `
        MATCH(post:${entity} {id:$entityId})
        UNWIND $userNames as name
        MATCH (user: User {userName: name})
        MERGE (user)-[:TAGGED_IN]->(post)
        RETURN user.id as id
          `,
      { userNames, entityId },
    );
  }
}

module.exports = new UserQueries();
