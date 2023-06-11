const { Query } = require('./query');

class FeedQueries extends Query {
  /**
   * Fetch following feed.
   *
   * @param {object} params Parameter object.
   * @param {string} params.id User id.
   * @param {number} params.page Page number.
   * @param {number>} params.limit Page size.
   *
   * @return {Promise<QueryResult>}
   */
  async followingFeed({ id, page, limit = 10 }) {
    return this.runner.run(
      `
    MATCH(user:User {id:$id})-[:FOLLOW]->()-[:CONTENT_IN]->(:Profile)<-[related:RELATED_TO|REPOST]-(content)
    WITH user ,labels(content) as label,related,content 
    ORDER BY content.createdDate DESC SKIP $skip LIMIT $limit
    WITH CASE 
        WHEN "Active" IN label THEN {
            entity:'ActivePoll', 
            type:content.type,
            totalLike:size( [ ()-[:LIKE]-(content) | content]  ),
            totalDislike:size( [ ()-[:DISLIKE]-(content) | content]  ),
            totalRight:size( [ ()-[:RIGHT_LIKE]-(content) | content]  ),
            totalLeft:size( [ ()-[:LEFT_LIKE]-(content) | content]  ),
            reacted:EXISTS((content)<--(user)),
            imageId:content.imageId
    } 
        WHEN "Ended" IN label THEN{
            entity:'EndedPoll', 
            type:content.type,
            endedDate:content.endedDate,
            totalLike:content.totalLike,
            totalDislike:content.totalDislike,
            totalRight:content.totalRight,
            totalLeft:content.totalLeft,
            imageId:content.imageId

    }
        WHEN "Post" IN label THEN {
            entity:'Post', 
            reactedUP:apoc.nodes.connected(user, content,"UP_VOTE>"),
            reactedDOWN:apoc.nodes.connected(user, content,"DOWN_VOTE>"),
            totalUpVotes:size( [ ()-[:UP_VOTE]->(content) | content]  ),
            totalDownVotes:size( [ ()-[:DOWN_VOTE]->(content) | content]  ),
            history:content.history,
            media:content.media,
            repostData:(CASE WHEN type(related)="REPOST" THEN {
              allowView: EXISTS((:Post {id:related.id})-[:RELATED_TO]->(:Public)) OR 
                 EXISTS((user)-[:FOLLOW]->(:User {id:related.ownerId})),
              id:related.id ,
              media:related.media,
              createdDate:related.createdDate,
              ownerId:related.ownerId,
              ownerImageId:related.ownerImageId,
              ownerName:related.ownerName, 
              description:related.description
              } END )
    
        }ELSE {
            entity:'Review', 
            productName:content.productName,
            productFirm:content.productFirm,
            rate:content.rate,
            imageId:content.imageId,
            reactedUP:apoc.nodes.connected(user, content,"UP_VOTE>"),
            reactedDOWN:apoc.nodes.connected(user, content,"DOWN_VOTE>"),
            totalUpVotes:size( [ ()-[:UP_VOTE]->(content) | content]  ),
            totalDownVotes:size( [ ()-[:DOWN_VOTE]->(content) | content]  )
        } END AS properties,content      
RETURN
    content.id as id,
    content.createdDate as createdDate,
    content.description as description,
    content.ownerId as ownerId,
    content.ownerImageId as ownerImageId,
    content.ownerName as ownerName, 
    properties
 
    `,
      { id, skip: this.int((page - 1) * limit), limit: this.int(limit) },
    );
  }

  /**
   * Fetch paid feed from users im subscribed for.
   *
   * @param {object} params Parameter object.
   * @param {string} params.id User id.
   * @param {number} params.page Page number.
   * @param {number>} params.limit Page size.
   *
   * @return {Promise<QueryResult>}
   */
  async paidFeed({ id, page, limit = 10 }) {
    return this.runner.run(
      `
    MATCH(user:User {id:$id})-[:SUBSCRIBE]->()-[:CONTENT_IN]->(:Paid)<-[:RELATED_TO]-(content)
    WITH user ,labels(content) as label,content 
    ORDER BY content.createdDate DESC SKIP $skip LIMIT $limit
    WITH CASE 
        WHEN "Post" IN label THEN {
            entity:'Post',
            history:content.history
        }ELSE {
            entity:'Review', 
            productName:content.productName,
            productFirm:content.productFirm,
            rate:content.rate
        } END AS properties,content,user  
RETURN
    content.id as id,
    content.media as media,
    content.description as description,
    content.createdDate as createdDate,
    content.ownerId as ownerId,
    content.ownerImageId as ownerImageId,
    content.ownerName as ownerName,
    apoc.nodes.connected(user, content,"UP_VOTE>") as reactedUP,
    apoc.nodes.connected(user, content,"DOWN_VOTE>") as reactedDOWN,
    size( [ ()-[:UP_VOTE]->(content) | content]  ) as totalUpVotes,
    size( [ ()-[:DOWN_VOTE]->(content) | content]  ) as totalDownVotes,
    properties
 
    `,
      { id, skip: this.int((page - 1) * limit), limit: this.int(limit) },
    );
  }

  /**
   * Fetch user paid feed.
   *
   * @param {object} params Parameter object.
   * @param {string} params.id User id.
   * @param {number} params.page Page number.
   * @param {number>} params.limit Page size.
   *
   * @return {Promise<QueryResult>}
   */
  async userPaidFeed({ id, page, limit = 10 }) {
    return this.runner.run(
      `
      MATCH(:Paid {id:$id})<-[:RELATED_TO]-(content),(user:User {id:$id})
      WITH user, labels(content) as label,content SKIP $skip LIMIT $limit
      WITH CASE 
          WHEN "Post" IN label THEN {
              entity:'Post',
              history:content.history
          }ELSE {
              entity:'Review', 
              productName:content.productName,
              productFirm:content.productFirm,
              rate:content.rate
          } END AS properties,content,user
      RETURN
      content.id as id,
      content.media as media,
      content.description as description,
      content.createdDate as createdDate,
      content.ownerId as ownerId,
      content.ownerImageId as ownerImageId,
      content.ownerName as ownerName, 
      EXISTS((content)<-[:UP_VOTE]-(user)) as reactedUP,
      EXISTS((content)<-[:DOWN_VOTE]-(user)) as reactedDOWN,
      size( [ ()-[:UP_VOTE]->(content) | content]  ) as totalUpVotes,
      size( [ ()-[:DOWN_VOTE]->(content) | content]  ) as totalDownVotes,
      properties
 
    `,
      { id, skip: this.int((page - 1) * limit), limit: this.int(limit) },
    );
  }

  /**
   * Fetch user content.
   *
   * @param {object} params Parameter object.
   * @param {string} params.id User id.
   * @param {number} params.page Page number.
   * @param {number>} params.limit Page size.
   *
   * @return {Promise<QueryResult>}
   */
  async userContent({ id, page, limit = 12 }) {
    return this.runner.run(
      `
    MATCH(content)-[related:RELATED_TO|REPOST]->(:Profile{id:$id}),(user:User{id:$id})
    WITH user ,labels(content) as label,related,content 
    ORDER BY content.createdDate DESC SKIP $skip LIMIT $limit
    WITH CASE 
        WHEN "Active" IN label THEN {
            entity:'ActivePoll', 
            type:content.type,
            totalLike:size( [ ()-[:LIKE]-(content) | content]  ),
            totalDislike:size( [ ()-[:DISLIKE]-(content) | content]  ),
            totalRight:size( [ ()-[:RIGHT_LIKE]-(content) | content]  ),
            totalLeft:size( [ ()-[:LEFT_LIKE]-(content) | content]  ),
            reacted:EXISTS((content)<-[:LIKE|DISLIKE|RIGHT_LIKE|LEFT_LIKE]-(user)),
            imageId:content.imageId
    } 
        WHEN "Ended" IN label THEN{
            entity:'EndedPoll', 
            type:content.type,
            endedDate:content.endedDate,
            totalLike:content.totalLike,
            totalDislike:content.totalDislike,
            totalRight:content.totalRight,
            totalLeft:content.totalLeft,
            imageId:content.imageId

    }
        WHEN "Post" IN label THEN {
            entity:'Post', 
            reactedUP:apoc.nodes.connected(user, content,"UP_VOTE>"),
            reactedDOWN:apoc.nodes.connected(user, content,"DOWN_VOTE>"),
            totalUpVotes:size( [ ()-[:UP_VOTE]->(content) | content]  ),
            totalDownVotes:size( [ ()-[:DOWN_VOTE]->(content) | content]  ),
            history:content.history,
            media:content.media,
            repostData:(CASE WHEN type(related)="REPOST" THEN {
              allowView: EXISTS((:Post {id:related.id})-[:RELATED_TO]->(:Public)) OR 
                 EXISTS((user)-[:FOLLOW]->(:User {id:related.ownerId})),
              id:related.id ,
              media:related.media,
              createdDate:related.createdDate,
              ownerId:related.ownerId,
              ownerImageId:related.ownerImageId,
              ownerName:related.ownerName, 
              description:related.description
              } END )
    
        }ELSE {
            entity:'Review', 
            productName:content.productName,
            productFirm:content.productFirm,
            rate:content.rate,
            media:content.media,
            reactedUP:apoc.nodes.connected(user, content,"UP_VOTE>"),
            reactedDOWN:apoc.nodes.connected(user, content,"DOWN_VOTE>"),
            totalUpVotes:size( [ ()-[:UP_VOTE]->(content) | content]  ),
            totalDownVotes:size( [ ()-[:DOWN_VOTE]->(content) | content]  )
        } END AS properties,content      
RETURN
    content.id as id,
    content.createdDate as createdDate,
    content.description as description,
    content.ownerId as ownerId,
    content.ownerImageId as ownerImageId,
    content.ownerName as ownerName, 
    properties
 
    `,
      { id, skip: this.int((page - 1) * limit), limit: this.int(limit) },
    );
  }

  /**
   * Fetch content user Tagged in.
   *
   * @param {object} params Parameter object.
   * @param {string} params.id User id.
   * @param {number} params.page Page number.
   * @param {number>} params.limit Page size.
   *
   * @return {Promise<QueryResult>}
   */
  async taggedContent({ id, page, limit = 12 }) {
    return this.runner.run(
      `
    MATCH (user:User{id:$id})-[:TAGGED_IN]->(content)
    WITH user ,labels(content) as label,content 
    ORDER BY content.createdDate DESC SKIP $skip LIMIT $limit
    WITH CASE 
        WHEN "Active" IN label THEN {
            entity:'ActivePoll', 
            type:content.type,
            totalLike:size( [ ()-[:LIKE]-(content) | content]  ),
            totalDislike:size( [ ()-[:DISLIKE]-(content) | content]  ),
            totalRight:size( [ ()-[:RIGHT_LIKE]-(content) | content]  ),
            totalLeft:size( [ ()-[:LEFT_LIKE]-(content) | content]  ),
            reacted:EXISTS((content)<-[:LIKE|DISLIKE|RIGHT_LIKE|LEFT_LIKE]-(user)),
            imageId:content.imageId
    } 
        WHEN "Ended" IN label THEN{
            entity:'EndedPoll', 
            type:content.type,
            endedDate:content.endedDate,
            totalLike:content.totalLike,
            totalDislike:content.totalDislike,
            totalRight:content.totalRight,
            totalLeft:content.totalLeft,
            imageId:content.imageId

    }
        WHEN "Post" IN label THEN {
            entity:'Post', 
            reactedUP:apoc.nodes.connected(user, content,"UP_VOTE>"),
            reactedDOWN:apoc.nodes.connected(user, content,"DOWN_VOTE>"),
            totalUpVotes:size( [ ()-[:UP_VOTE]->(content) | content]  ),
            totalDownVotes:size( [ ()-[:DOWN_VOTE]->(content) | content]  ),
            history:content.history,
            media:content.media
    
        }ELSE {
            entity:'Review', 
            productName:content.productName,
            productFirm:content.productFirm,
            rate:content.rate,
            media:content.media,
            reactedUP:apoc.nodes.connected(user, content,"UP_VOTE>"),
            reactedDOWN:apoc.nodes.connected(user, content,"DOWN_VOTE>"),
            totalUpVotes:size( [ ()-[:UP_VOTE]->(content) | content]  ),
            totalDownVotes:size( [ ()-[:DOWN_VOTE]->(content) | content]  )
        } END AS properties,content      
RETURN
    content.id as id,
    content.createdDate as createdDate,
    content.description as description,
    content.ownerId as ownerId,
    content.ownerImageId as ownerImageId,
    content.ownerName as ownerName, 
    properties
 
    `,
      { id, skip: this.int((page - 1) * limit), limit: this.int(limit) },
    );
  }
}

module.exports = new FeedQueries();
