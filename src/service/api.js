const { Op } = require('neogma');
const { formatResponse, toNativeTypes } = require('../utils/requests');
const { queryInstance: query } = require('../queries/query');
const { deleteCacheByPattern } = require('../utils/redis');
const { Genre } = require('../models');

/**
 * Create Relation ship rout handler.
 *
 * @param {object} model
 *
 * @return {Promise} Rout handler.
 */
exports.createRelationShip =
  (model) =>
  /**
   * Create Relation ship  model -[relation]-> another.
   *
   * @param {import('express').Request} req Request object.
   * @param {import('express').Response} res Response object.
   */
  async (req, res) => {
    const { fromId, relation, toId } = req.body;
    const config = model.relationships[relation];
    const targetModel = model.getRelationshipByAlias(relation).model;
    const target =
      targetModel === 'self'
        ? model.getModelName()
        : model.getRelationshipByAlias(relation).model.getModelName();
    await query.createRelation({
      from: model.getModelName(),
      fromId,
      target,
      toId,
      relation: config.name,
    });

    res.send(formatResponse({}, 'Relationship Created'));
  };

/**
 * Delete Relation ship rout handler.
 *
 * @param {object} model
 *
 * @return {Promise} Rout handler.
 */
exports.deleteRelationShip =
  (model) =>
  /**
   * Delete Relation ship  model -[relation]-> another.
   *
   * @param {import('express').Request} req Request object.
   * @param {import('express').Response} res Response object.
   */
  async (req, res) => {
    const { fromId, relation, toId } = req.body;
    await model.deleteRelationships({
      alias: relation,
      where: {
        source: { id: fromId },
        target: { id: toId },
      },
    });

    res.send(formatResponse({}, 'Relationship Deleted'));
  };

/**
 * Get counts for an entity that has up votes and down votes.
 *
 * @param {string} entity Entity name.
 *
 * @return {Promise} Rout handler.
 */
exports.getUpDownVotesCount =
  (entity) =>
  /**
   * Get -[:UPVOTE|DOWNVOTE]->(Entity).
   *
   * @param {import('express').Request} req Request object.
   * @param {import('express').Response} res Response object.
   */
  async (req, res) => {
    const { id } = req.query;
    const result = await query.getEntityCounts(id, entity);
    res.send(
      formatResponse(toNativeTypes(result.records), `${entity} count fetched`),
    );
  };

/**
 * Generate Soft delete rout handler.
 *
 * @param {string} entity Entity name.
 *
 * @return {Promise} Rout handler.
 */
exports.softDeleteEntity =
  (entity) =>
  /**
   * Soft delete entity.
   *
   * @param {import('express').Request} req Request object.
   * @param {import('express').Response} res Response object.
   */
  async (req, res) => {
    const { id } = req.query;
    const result = await query.softDelete(id, entity);
    await deleteCacheByPattern(`*${entity}*${result.records[0].get('id')}*`);
    res.send(formatResponse({}, `${entity} Deleted`));
  };

/**
 * Check if genres exist and return relation object;
 *
 * @param {array<string>|undefined} genres
 * @param {string} relation Relation name in OGM.
 *
 * @returns {object} Genre relation object.
 */
exports.inGenreCheck = async (genres, relation) => {
  if (typeof genres === 'undefined' || genres === [] || genres === null)
    return {};

  await Genre.createMany(
    genres.map((g) => ({ name: g })),
    { merge: true },
  );
  return {
    [relation]: {
      where: {
        merge: true,
        params: {
          name: {
            [Op.in]: genres,
          },
        },
      },
    },
  };
};
