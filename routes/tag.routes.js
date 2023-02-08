// tag.routes.js

const Joi = require("joi");

const { appSchema } = require("../schema/app.schema");
const { entitySchema, entityIdSchema } = require("../schema/entity.schema");
const { tagSchema } = require("../schema/tag.schema");
const { appsKey, appEntitiesKey, appEntityTagsKey, tagKey, taggedWithKey } = require("../utils/keys.util");
const { validatorCompiler } = require("../utils/validatorCompiler.util");

/**
 * Encapsulates Tag routes
 * @param {FastifyInstance} fastify Fastify instance
 * @param {Object} options Plugin options
 */
async function routes(fastify, options) {
    fastify.post("/api/tag/:app_name/:entity_name/:entity_id/with/:tag_name", {
        schema: {
            params: Joi.object().keys({ ...appSchema, ...entitySchema, ...entityIdSchema, ...tagSchema })
        },
        validatorCompiler,
        preHandler: async (request, reply, done) => {
            const client = fastify.redis;
            const { app_name, entity_name, tag_name } = request.params;

            const appExists = await client.sismember(appsKey(), app_name);
            const entityValid = await client.sismember(appEntitiesKey(app_name), entity_name);
            const tagValid = await client.sismember(appEntityTagsKey(app_name, entity_name), tag_name);

            if (appExists && entityValid && tagValid) {
                done();
            } else {
                reply.status(400).send({
                    error:
                        `${!appExists && `App ${app_name} does not exist`}` &&
                        `${!entityValid && `Entity ${entity_name} is not valid for this app`}` &&
                        `${!tagValid && `Tag ${tag_name} is not valid for this entity`}`
                });
            }

        }
    }, async (request, reply) => {
        const client = fastify.redis;
        const { app_name, entity_name, entity_id, tag_name } = request.params;

        await client.sadd(taggedWithKey(app_name, entity_name, tag_name), entity_id);

        reply.status(201);
    });

    fastify.delete("/api/untag/:app_name/:entity_name/:entity_id/with/:tag_name", {
        schema: {
            params: Joi.object().keys({ ...appSchema, ...entitySchema, ...entityIdSchema, ...tagSchema })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = fastify.redis;
        const { app_name, entity_name, entity_id, tag_name } = request.params;

        await client.srem(taggedWithKey(app_name, entity_name, tag_name), entity_id);

        reply.status(204);
    })
}

module.exports = routes;