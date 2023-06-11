const { currentDate } = require('../utils/date');
const { Query } = require('./query');

class PostQueries extends Query {
  /**
   * Updates post and saves older version.
   *
   * @param {object} params Parameter object.
   * @param {string} params.id
   * @param {string} params.description
   *
   * @return {Promise<QueryResult>}
   */
  async updatePost({ id, description }) {
    return this.runner.run(
      `
    MATCH(post:Post {id:$id})
    SET 
    post.history=post.description+post.history,
    post.description=$description
    `,
      { id, description },
    );
  }

  /**
   * Fetches posts created by user.
   *
   * @param {object} params Parameter object.
   * @param {string} params.ownerId
   * @param {string} params.viewerId
   * @param {number} params.page
   * @param {number?} params.limit
   *
   * @return {Promise<QueryResult>}
   */
  async postsByUser({ ownerId, viewerId, page, limit = 10 }) {
    return this.runner.run(
      `
    MATCH (post:Post)-[relation:RELATED_TO|REPOST]->(:Profile{id:$ownerId})
    WITH  relation,post SKIP $skip LIMIT $limit
    MATCH (viewer:User{id:$viewerId})
    WITH CASE WHEN type(relation)="REPOST" THEN {
      allowView: EXISTS((:Post {id:relation.id})-[:RELATED_TO]->(:Public)) OR 
                 EXISTS((viewer)-[:FOLLOW]->(:User {id:relation.ownerId})),
      id:relation.id ,
      media:relation.media,
      createdDate:relation.createdDate,
      ownerId:relation.ownerId,
      ownerImageId:relation.ownerImageId,
      ownerName:relation.ownerName, 
      description:relation.description,
      repost:true
    }ELSE {allowView:true,repost:false} END AS properties,post,viewer
    RETURN
          post.id as id,
          post.description as description,
          post.media as media,
          post.createdDate as createdDate,
          post.history as history,
          apoc.nodes.connected(viewer, post,"UP_VOTE>") as reactedUP,
          apoc.nodes.connected(viewer, post,"DOWN_VOTE>")as reactedDOWN,
          properties
  `,
      {
        ownerId,
        viewerId,
        skip: this.int((page - 1) * limit),
        limit: this.int(limit),
      },
    );
  }

  /**
   * Repost in user timeline.
   *
   * @param {object} params Parameter object.
   * @param {string} params.userId  Repost owner id.
   * @param {string} params.postId post id to be reposted.
   * @param {string} params.repostId New post id.
   * @param {string} params.description New post description
   */
  async rePost({ userId, postId, repostId, description }) {
    return this.runner.run(
      `
      MATCH (post:Post {id:$postId}),(profile:Profile {id:$userId}),(user:User {id:$userId})
      MERGE (user)-[:CREATE]->(newPost:Post {id:$repostId})-[repost:REPOST]->(profile)
      SET 
      newPost.ownerId=user.id,
      newPost.ownerImageId=profile.imageId,
      newPost.ownerName=user.firstName+" "+user.lastName,
      newPost.description=$description,
      newPost.createdDate=$date,
      repost.id = post.id,
      repost.imageId = post.imageId,
      repost.createdDate = post.createdDate,
      repost.ownerId = post.ownerId,
      repost.ownerImageId = post.ownerImageId,
      repost.ownerName = post.ownerName, 
      repost.description = post.description

  `,
      { userId, postId, repostId, description, date: currentDate() },
    );
  }

  /**
   * Fetches posts that contains the sub description.
   *
   * @param {object} params Parameter object.
   * @param {string} params.id
   * @param {string} params.description
   * @param {number} params.page
   * @param {number?} params.limit
   *
   * @return {Promise<QueryResult>}
   */
  async postsByDescription({ id, description, page, limit = 10 }) {
    return this.runner.run(
      `
    MATCH (post:Post)-[relation:RELATED_TO|REPOST]->(:Public)
    WHERE post.description contains $description
    WITH  relation,post SKIP $skip LIMIT $limit
    MATCH (viewer:User{id:$id})
    WITH CASE WHEN type(relation)="REPOST" THEN {
      allowView: EXISTS((post)-[:RELATED_TO]->(:Public)) OR 
                 EXISTS((viewer)-[:FOLLOW]->(:User {id:post.ownerId})),
      repost:true,
      id:relation.id ,
      imageId:relation.imageId,
      createdDate:relation.createdDate,
      ownerId:relation.ownerId,
      ownerImageId:relation.ownerImageId,
      ownerName:relation.ownerName, 
      description:relation.description
    }ELSE {allowView:true,repost:false} END AS properties,post,viewer
    RETURN
            post.id as id,
            post.type as type,
            post.description as description,
            post.imageId as imageId,
            post.createdDate as createdDate,
            post.ownerId as ownerId,
            post.ownerImageId as ownerImageId,
            post.ownerName as ownerName,
            post.history as history,
            apoc.nodes.connected(viewer, post,"UP_VOTE>") as reactedUP,
            apoc.nodes.connected(viewer, post,"DOWN_VOTE>")as reactedDOWN,
              size( [ ()-[:UP_VOTE]->(post) | post]  ) as totalUpVotes,
              size( [ ()-[:DOWN_VOTE]->(post) | post]  ) as totalDownVotes,
              properties
  `,
      {
        id,
        description,
        skip: this.int((page - 1) * limit),
        limit: this.int(limit),
      },
    );
  }
}

module.exports = new PostQueries();
