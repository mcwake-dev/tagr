// entity_tags.routes.js

const Joi = require("joi");

const { appSchema } = require("../schema/app.schema");
const { entitySchema } = require("../schema/entity.schema");
const { entityTagSchema } = require("../schema/entity_tag.schema");
const { appsKey, appEntityTagsKey, appEntitiesKey, taggedWithKey } = require("../utils/keys.util");
const { validatorCompiler } = require("../utils/validatorCompiler.util");

/**
 * Encapsulates Entity Tags routes
 * @param {FastifyInstance} fastify Fastify instance
 * @param {Object} options Plugin options
 */
async function routes(fastify, options) {
    fastify.get("/api/apps/:app_name/entities/:entity_name/tags", {
        schema: {
            params: Joi.object().keys({ ...appSchema, ...entitySchema })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = fastify.redis;
        const { app_name, entity_name } = request.params;
        const tags = await client.smembers(appEntityTagsKey(app_name, entity_name));

        if (tags.length === 0) {
            reply.status(404);
        }

        return tags;
    });

    fastify.post("/api/apps/:app_name/entities/:entity_name/tags", {
        schema: {
            params: Joi.object().keys({ ...appSchema, ...entitySchema }),
            body: Joi.object().keys({ ...entityTagSchema })
        },
        validatorCompiler,
        preHandler: async (request, reply, done) => {
            const client = fastify.redis;
            const { app_name, entity_name } = request.params;

            const appExists = await client.sismember(appsKey(), app_name);
            const entityValid = await client.sismember(appEntitiesKey(app_name), entity_name);

            if (appExists && entityValid) {
                done();
            } else {
                reply.status(400).send({
                    error:
                        `${!appExists && `App ${app_name} does not exist`}` &&
                        `${!entityValid && `Entity ${entity_name} is not valid for this app`}`
                })
            }
        }
    }, async (request, reply) => {
        const client = fastify.redis;
        const { app_name, entity_name } = request.params;
        const { entity_tag_name } = request.body;

        await client.sadd(appEntityTagsKey(app_name, entity_name), entity_tag_name);

        reply.status(201);
    });

    fastify.delete("/api/apps/:app_name/entities/:entity_name/tags/:entity_tag_name", {
        schema: {
            params: Joi.object().keys({ ...appSchema, ...entitySchema, ...entityTagSchema })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = fastify.redis;
        const { app_name, entity_name, entity_tag_name } = request.params;

        await client
            .multi()
            .srem(appEntityTagsKey(app_name, entity_name), entity_tag_name)
            .del(taggedWithKey(app_name, entity_name, tag_name))
            .exec();

        reply.status(204);
    });
}

module.exports = routes;