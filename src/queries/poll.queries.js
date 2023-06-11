const { Query } = require('./query');

class PollQueries extends Query {
  /**
   * Fetches the poll removes active label
   * and get like,dislike , uncertain,left likes,right likes counts from meta data in constant time
   * then it assign them as an attributes to the node and sets ended label
   * also it increment user base likes and dislikes.
   *
   * @param {string} id Poll id.
   *
   * @return {Promise<QueryResult>}
   */
  async endPoll(id) {
    return this.runner.run(
      `
      MATCH (poll:Poll {id:$id})
      MATCH (owner:User {id:poll.ownerId})
      REMOVE poll:Active
      SET 
      poll:Ended,
      poll.endedDate=Date(),
      (CASE WHEN poll.type = "single" THEN poll END).totalLike = size( [ ()-[:LIKE]-(poll) | poll]  ),
      (CASE WHEN poll.type = "single" THEN poll END).totalDislike = size( [ ()-[:DISLIKE]-(poll) | poll]  ),
      (CASE WHEN poll.type = "single" THEN poll END).totalUncertain = size( [ ()-[:UNCERTAIN]-(poll) | poll]  ),
      (CASE WHEN poll.type = "double" THEN poll END).totalRight = size( [ ()-[:RIGHT_LIKE]-(poll) | poll]  ),
      (CASE WHEN poll.type = "double" THEN poll END).totalLeft = size( [ ()-[:LEFT_LIKE]-(poll) | poll]  ),
      (CASE WHEN poll.type = "single" THEN owner END).totalLike =owner.totalLike + size( [ ()-[:LIKE]-(poll) | poll]  ),
      (CASE WHEN poll.type = "single" THEN owner END).totalDislike =owner.totalDislike + size( [ ()-[:DISLIKE]-(poll) | poll]  )
      `,
      { id },
    );
  }

  /**
   * Fetches random 10 polls that the user requested them didn't react to or create.
   *
   * @param {string} id User id.
   *
   * @return {Promise<QueryResult>}
   */
  async randomPolls(id) {
    return this.runner.run(
      `
        MATCH (user:User {id:$id}), (:Public)<--(p:Active)
        WHERE NOT(p)<--(user) OR (p)<-[:TAGGED_IN]-(user)
        WITH apoc.coll.randomItems(collect(p),10) as random,user
        UNWIND random as poll
        RETURN  
        poll.id as id,
        poll.type as type,
        poll.imageId as imageId,
        poll.description as description,
        poll.createdDate as createdDate,
        poll.ownerId as ownerId,
        poll.ownerName as ownerName,
        poll.ownerImageId as ownerImageId,
        EXISTS((user)-[:FOLLOW]->(:User {id:poll.ownerId}))as followed,
        CASE WHEN poll.type = "single" THEN size( [ ()-[:LIKE]-(poll) | poll]  ) END as totalLike,
        CASE WHEN poll.type = "single" THEN size( [ ()-[:DISLIKE]-(poll) | poll]  ) END as totalDislike,
        CASE WHEN poll.type = "double" THEN size( [ ()-[:RIGHT_LIKE]-(poll) | poll]  ) END as totalRight,
        CASE WHEN poll.type = "double" THEN size( [ ()-[:LEFT_LIKE]-(poll) | poll]  ) END as totalLeft 
      `,
      { id },
    );
  }

  /**
   * Fetches polls created by user.
   * Doesn't care about other user interactions.
   *
   * @param {object} params Parameter object.
   * @param {string} params.id User id.
   * @param {number} params.page Page number.
   * @param {number>} params.limit Page size.
   *
   * @return {Promise<QueryResult>}
   */
  async pollsByMe({ id, page, limit = 10 }) {
    return this.runner.run(
      `
        MATCH (:User {id:$id})-[:CREATE]->(poll:Poll)
        WITH CASE 
            WHEN "Active" IN labels(poll) THEN {status:'Active'}
            ELSE {
              endedDate:poll.endedDate,
              totalLike:poll.totalLike,
              totalDislike:poll.totalDislike,
              totalUncertain:poll.totalUncertain,
              totalRight:poll.totalRight,
              totalLeft:poll.totalLeft, 
              status:'Ended'
            }END AS properties,poll
        RETURN 
        poll.id as id,
        poll.type as type,
        poll.description as description,
        poll.imageId as imageId,
        poll.createdDate as createdDate,
        properties
        SKIP $skip LIMIT $limit`,
      { id, skip: this.int((page - 1) * limit), limit: this.int(limit) },
    );
  }

  /**
   * Fetches polls created by other.
   *
   * @param {object} params Parameter object.
   * @param {string} params.ownerId
   * @param {string} params.viewerId
   * @param {number} params.page
   * @param {number?} params.limit
   *
   * @return {Promise<QueryResult>}
   */
  async pollsByOthers({ ownerId, viewerId, page, limit = 10 }) {
    return this.runner.run(
      `
        MATCH (owner:User {id:$ownerId})-[:CREATE]->(poll:Poll)
        WITH  poll SKIP $skip LIMIT $limit
        MATCH (viewer:User{id:$viewerId})
        WITH poll,EXISTS((poll)<-[:LIKE|DISLIKE|UNCERTAIN|RIGHT_LIKE|LEFT_LIKE]-(viewer)) as reacted,labels(poll)as label
        WITH CASE
          WHEN "Active" IN label and poll.type="single"
            THEN   {totalLike:size( [ ()-[:LIKE]-(poll) | poll]  ),
            totalDislike:size( [ ()-[:DISLIKE]-(poll) | poll]  ),status:'Active' }
  
          WHEN  poll.type="single"
            THEN  {endedDate:poll.endedDate,
              totalLike:poll.totalLike,totalDislike:poll.totalDislike,status:'Ended'}
  
          WHEN "Active" IN label and poll.type="double"
             THEN   {totalRight:size( [ ()-[:RIGHT_LIKE]-(poll) | poll]  ),
            totalLeft:size( [ ()-[:LEFT_LIKE]-(poll) | poll]  ),status:'Active' }
  
          WHEN  poll.type="double"
            THEN  {endedDate:poll.endedDate,
              totalRight:poll.totalRight,totalLeft:poll.totalLeft,status:'Ended'}
              
        END AS properties,reacted,poll
        RETURN
              poll.id as id,
              poll.type as type,
              poll.description as description,
              poll.imageId as imageId,
              poll.createdDate as createdDate,
              properties,
              reacted
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
   * Fetches polls related to a specific genre.
   
   * @param {object} params Parameter object.
   * @param {string} params.id User id.
   * @param {string} params.genre Genre name.
   * @param {number} params.page Page number.
   * @param {number?} params.limit Page size.
   *
   * @return {Promise<QueryResult>}
   */
  async pollsByGenre({ id, genre, page, limit = 10 }) {
    return this.runner.run(
      `
        MATCH (:Public)<--(poll:Poll)-[:IN_GENRE]->(:Genre {name:$genre}) 
        WITH  poll SKIP $skip LIMIT $limit
        MATCH (viewer:User{id:$id})
        WITH poll,EXISTS((poll)<--(viewer)) as reacted,labels(poll) as label
        WITH CASE
           WHEN "Active" IN label and poll.type="single"
            THEN   {totalLike:size( [ ()-[:LIKE]-(poll) | poll]  ),
            totalDislike:size( [ ()-[:DISLIKE]-(poll) | poll]  ),status:'Active' }
  
          WHEN  poll.type="single"
            THEN  {endedDate:poll.endedDate,
            totalLike:poll.totalLike,totalDislike:poll.totalDislike,status:'Ended'}
  
          WHEN "Active" IN label and poll.type="double"
           THEN   {totalRight:size( [ ()-[:RIGHT_LIKE]-(poll) | poll]  ),
           totalLeft:size( [ ()-[:LEFT_LIKE]-(poll) | poll]  ),status:'Active' }
  
          WHEN  poll.type="double"
           THEN  {endedDate:poll.endedDate,
            totalRight:poll.totalRight,totalLeft:poll.totalLeft,status:'Ended'}
            
      END AS properties,reacted,poll
        RETURN
                poll.id as id,
                poll.type as type,
                poll.description as description,
                poll.imageId as imageId,
                poll.createdDate as createdDate,
                poll.ownerId as ownerId,
                poll.ownerImageId as ownerImageId,
                poll.ownerName as ownerName,
                properties,
                reacted
      
      `,
      {
        id,
        genre,
        skip: this.int((page - 1) * limit),
        limit: this.int(limit),
      },
    );
  }

  /**
   * Gets total counts for a Active poll.
   *
   * @param {string} id Poll id.
   *
   * @return {Promise<QueryResult>}
   */
  async getPollCounts(id) {
    return this.runner.run(
      `
      MATCH (poll:Active { id:$id})
      RETURN 
      CASE WHEN poll.type = "single" THEN size( [ ()-[:LIKE]-(poll) | poll]  ) END as totalLike,
      CASE WHEN poll.type = "single" THEN size( [ ()-[:UNCERTAIN]-(poll) | poll]  ) END as totalUncertain,
      CASE WHEN poll.type = "single" THEN size( [ ()-[:DISLIKE]-(poll) | poll]  ) END as totalDislike,
      CASE WHEN poll.type = "double" THEN size( [ ()-[:RIGHT_LIKE]-(poll) | poll]  ) END as totalRight,
      CASE WHEN poll.type = "double" THEN size( [ ()-[:LEFT_LIKE]-(poll) | poll]  ) END as totalLeft 
      `,
      { id },
    );
  }
}

module.exports = new PollQueries();
