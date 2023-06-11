const { Query } = require('./query');

class CommentQueries extends Query {
  /**
   * Fetches comments page.
   *
   * @param {object} params Parameter object.
   * @param {string} params.id Comment id.
   * @param {string} params.entity Comment for poll or post.
   * @param {number} params.page Page number.
   * @param {number?} params.limit Page size.
   *
   * @return {Promise<QueryResult>}
   */
  async getComments({ id, entity, page, limit = 10 }) {
    return this.runner.run(
      `
         MATCH (:${entity}{id:$id})<-[:RELATED_TO]-(c:Comment)
         WITH c SKIP $skip LIMIT $limit
         RETURN 
         c.id as id,
         c.ownerId as ownerId,
         c.ownerName as ownerName,
         c.comment as comment ,
         c.ownerImageId as ownerImageId,
         c.history as history,
         c.createdDate as createdDate ,
         size( [ (c)<-[:RELATED_TO]-(:Comment) | c]  )as totalReply
      `,
      { id, skip: this.int((page - 1) * limit), limit: this.int(limit) },
    );
  }

  /**
   * Updates comment and saves older version.
   *
   * @param {object} params Parameter object.
   * @param {string} params.id
   * @param {string} params.comment
   *
   * @return {Promise<QueryResult>}
   */
  async updateComment({ id, comment }) {
    return this.runner.run(
      `
    MATCH(comment:Comment {id:$id})
    SET 
    comment.history=comment.comment+comment.history,
    comment.comment=$comment
    `,
      { id, comment },
    );
  }
}

module.exports = new CommentQueries();
