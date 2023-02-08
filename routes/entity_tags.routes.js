// entity_tags.routes.js

const Joi = require("joi");

const { appSchema } = require("../schema/app.schema");
const { entitySchema } = require("../schema/entity.schema");
const { entityTagSchema } = require("../schema/entity_tag.schema");
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
        const tags = await client.smembers(`apps!${app_name}!${entity_name}!tags`);

        if (tags.length === 0) {
            reply.status(404);
        }

        return tags;
    });

    fastify.post("/api/apps/:app_name/entities/:entity_name/tags", {
        schema: {
            params: Joi.object().keys({ ...appSchema, ...entitySchema }),
            body: Joi.object().keys({ ...entityTagSchema })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = fastify.redis;
        const { app_name, entity_name } = request.params;
        const { entity_tag_name } = request.body;

        await client.sadd(`apps!${app_name}!${entity_name}!tags`, entity_tag_name);

        reply.status(201);
    });

    fastify.delete("/api/apps/:app_name/entities/:entity_name/tags/:entity_tag_name", {
        schema: {
            params: Joi.object().keys({ ...appSchema, ...entitySchema, ...entityTagSchema })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = fastify.redis;
        const { app_name, entity_name, entity_tag_name } = request.params;

        await client.srem(`apps!${app_name}!${entity_name}!tags`, entity_tag_name);

        reply.status(204);
    });
}

module.exports = routes;