/* eslint-disable no-console */
const { QueryRunner, neo4jDriver } = require('neogma');
const { neogma } = require('../models/index');
const { isDevEnv } = require('../utils/environment');

const { int } = neo4jDriver;

/**
 * Service for running raw queries with neo4j driver
 */
class Query {
  constructor() {
    this.int = int;
    this.driver = neogma.driver;
    this.runner = new QueryRunner({
      driver: this.driver,
      logger: isDevEnv() && console.log,
    });
  }

  /**
   * Executes all the queries concurrently.
   *
   * @param {Array.<Promise>} queries Array of async functions.
   *
   * @return {Array}  queries responses array
   */
  async transaction(queries) {
    const session = this.driver.session();
    const transaction = session.beginTransaction();
    const responses = await Promise.all(queries.map((fn) => fn(transaction)));
    await transaction.commit();
    await session.close();
    return responses;
  }

  /**
   * Creates a Constraint for a node in the database.
   *
   * @param {object} params Parameter object.
   * @param {string} params.model Model name.
   * @param {string} params.name Constraint name.
   * @param {string} params.property Property the constraint for.
   * @param {string} params.constraint Constraint type.
   * @param {object?} params.session Session or transaction object otherwise its null.
   */
  async createConstraint({
    model,
    name,
    property,
    constraint,
    session = null,
  }) {
    await this.runner.run(
      `CREATE CONSTRAINT ${name} IF NOT EXISTS FOR (node:${model}) REQUIRE node.${property} ${constraint}`,
      {},
      session,
    );
  }

  /**
   * Creates a Text Index for a node in the database.
   *
   * @param {object} params Parameter object.
   * @param {string} params.model Model name.
   * @param {string} params.name Index name.
   * @param {string} params.property Property the index for.
   * @param {object?} params.session Session or transaction object otherwise its null.
   */
  async createTextIndex({ model, name, property, session = null }) {
    await this.runner.run(
      `CREATE TEXT INDEX ${name} IF NOT EXISTS FOR (node:${model}) ON (node.${property})`,
      {},
      session,
    );
  }

  /**
   * Create Full text searching for fast queries.
   *
   * @param {object} params Parameter object.
   * @param {string} params.model Model name.
   * @param {string} params.name Constraint name.
   * @param {array.<string>} params.properties Property the constraint for.
   * @param {object?} params.session Session or transaction object otherwise its null.
   */
  async createFullTextIndex({ model, name, properties, session = null }) {
    const indexList = properties.map((property) => `n.${property}`).join(', ');
    await this.runner.run(
      `
    CREATE FULLTEXT INDEX ${name} IF NOT EXISTS  FOR (n:${model}) ON EACH [${indexList}]
    `,
      {},
      session,
    );
  }

  /**
   * Gets total counts for an entity that has up and down votes.
   *
   * @param {string} id entity id.
   * @param {string} entity entity name.
   *
   * @return {Promise<QueryResult>}
   */
  async getEntityCounts(id, entity) {
    return this.runner.run(
      `
    MATCH (entity:${entity} { id:$id})
    RETURN 
    size( [ ()-[:UP_VOTE]->(entity) | entity]  ) as totalUpVotes,
    size( [ ()-[:DOWN_VOTE]->(entity) | entity]  ) as totalDownVotes
    `,
      { id },
    );
  }

  /**
   * Soft deletes any entity in db.
   *
   * @param {string} id Entity id.
   * @param {string} entity Entity name.
   *
   * @return {Promise<QueryResult>}
   */
  async softDelete(id, entity) {
    return this.runner.run(
      `
       MATCH ()-[relation1:CREATE]->(entity:${entity} {id:$id})-[relation2:RELATED_TO|REPOST|IN_GENRE]->()
       CALL apoc.create.removeLabels(entity, labels(entity))
       YIELD node
       DELETE relation1,relation2
       SET entity:Deleted,entity.deletedDate=dateTime(),entity.entity=$entity
       return entity.ownerId as id
      `,
      { id, entity },
    );
  }

  /**
   * Gets genre by  name
   *
   * @param {object} params Parameter object.
   * @param {string} params.genre Genre name.
   * @param {number} params.page Page number.
   * @param {number?} params.limit Page size.
   *
   * @return {Promise<QueryResult>}
   */
  async getGenreByName({ name, page, limit = 10 }) {
    return this.runner.run(
      `
        MATCH (genre:Genre)
        WHERE genre.name STARTS WITH $name
        RETURN genre.name as name
        SKIP $skip LIMIT $limit
        `,
      { name, skip: this.int((page - 1) * limit), limit: this.int(limit) },
    );
  }

  /**
   * Creates a relation between two nodes.
   *
   * @param {object} params Parameter object.
   * @param {string} params.from From node name.
   * @param {string} params.fromId From node id.
   * @param {string} params.target Target node name.
   * @param {string} params.toId Target node id.
   * @param {string} params.relation Relation name.
   *
   * @return {Promise<QueryResult>}
   */
  async createRelation({ from, fromId, target, toId, relation }) {
    return this.runner.run(
      `
      MATCH(from:${from} {id:$fromId}), (to:${target} {id:$toId})
      MERGE(from)-[r:${relation}]->(to)
        `,
      { fromId, toId },
    );
  }
}

module.exports = { Query, queryInstance: new Query() };
