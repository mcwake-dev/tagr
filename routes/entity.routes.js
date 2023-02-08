// entity.routes.js

const Joi = require("joi");

const { validatorCompiler } = require("../utils/validatorCompiler.util");
const { appSchema } = require("../schema/app.schema");
const { entitySchema } = require("../schema/entity.schema");

/**
 * Encapsulates Entity routes
 * @param {FastifyInstance} fastify Fastify instance
 * @param {Object} options Plugin options
 */
async function routes(fastify, options) {
    fastify.get("/api/apps/:app_name/entities", {
        schema: {
            params: Joi.object().keys({ ...appSchema })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = fastify.redis;
        const { app_name } = request.params;
        const entities = await client.smembers(`apps!${app_name}`);

        if (entities.length === 0) {
            reply.status(404);
        }

        return entities;
    });

    fastify.post("/api/apps/:app_name/entities", {
        schema: {
            params: Joi.object().keys({ ...appSchema }),
            body: Joi.object().keys({ ...entitySchema })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = fastify.redis;
        const { app_name } = request.params;
        const { entity_name } = request.body;

        await client.sadd(`app!${app_name}!entities`, entity_name);

        reply.status(201);
    });

    fastify.delete("/api/apps/:app_name/entities/:entity_name", {
        schema: {
            params: Joi.object().keys({ ...appSchema, ...entitySchema }),
        }, validatorCompiler
    }, async (request, reply) => {
        const client = fastify.redis;
        const { app_name, entity_name } = request.params;

        await client.srem(`app!${app_name}!entities`, entity_name);

        reply.status(204);
    })
}

module.exports = routes;