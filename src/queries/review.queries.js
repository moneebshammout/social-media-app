const { Query } = require('./query');

class ReviewQueries extends Query {
  /**
   * Fetches reviews created by user.
   *
   * @param {object} params Parameter object.
   * @param {string} params.ownerId
   * @param {string} params.viewerId
   * @param {number} params.page
   * @param {number?} params.limit
   *
   * @return {Promise<QueryResult>}
   */
  async reviewsByUser({ ownerId, viewerId, page, limit = 10 }) {
    return this.runner.run(
      `
    MATCH (review:Review)-[:RELATED_TO]->(:Profile{id:$ownerId})
    WITH  review SKIP $skip LIMIT $limit
    MATCH (viewer:User{id:$viewerId})
    RETURN
          review.id as id,
          review.productName as productName,
          review.productFirm as productFirm,
          review.rate as rate,
          review.description as description,
          review.imageId as imageId,
          review.createdDate as createdDate,
          apoc.nodes.connected(viewer, review,"UP_VOTE>") as reactedUP,
          apoc.nodes.connected(viewer, review,"DOWN_VOTE>")as reactedDOWN
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
   * Uses Full-text indexes from  Apache Lucene in neo4j for fast searching.
   *
   * @param {object} params Parameter object.
   * @param {string} params.id User id.
   * @param {string} params.name Review product or firm name.
   * @param {number} params.page Page number.
   * @param {number?} params.limit Page size.
   *
   * @return {Promise<QueryResult>}
   */
  async getReviewByName({ id, name, page, limit = 10 }) {
    return this.runner.run(
      `
      CALL db.index.fulltext.queryNodes("review_product_firm_name", $name) YIELD node
      WHERE EXISTS((node)-->(:Public))
      WITH  node SKIP $skip LIMIT $limit
      MATCH (viewer:User{id:$id})
        RETURN
        node.id as id,
        node.productName as productName,
        node.productFirm as productFirm,
        node.rate as rate,
        node.description as description,
        node.imageId as imageId,
        node.createdDate as createdDate,
        node.ownerId as ownerId,
        node.ownerImageId as ownerImageId,
        node.ownerName as ownerName,
        apoc.nodes.connected(viewer, node,"UP_VOTE>") as reactedUP,
        apoc.nodes.connected(viewer, node,"DOWN_VOTE>")as reactedDOWN,
        size( [ ()-[:UP_VOTE]->(node) | node]  ) as totalUpVotes,
        size( [ ()-[:DOWN_VOTE]->(node) | node]  ) as totalDownVotes
        SKIP $skip LIMIT $limit
        `,
      { name, id, skip: this.int((page - 1) * limit), limit: this.int(limit) },
    );
  }
}

module.exports = new ReviewQueries();
