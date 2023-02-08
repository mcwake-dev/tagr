// entity.routes.js

const Joi = require("joi");

const { validatorCompiler } = require("../utils/validatorCompiler.util");
const { appSchema } = require("../schema/app.schema");

/**
 * Encapsulates Entity routes
 * @param {FastifyInstance} fastify Fastify instance
 * @param {Object} options Plugin options
 */
async function routes(fastify, options) {
    fastify.get("/api/apps", async (request, reply) => {
        const client = fastify.redis;

        const apps = await client.smembers(`apps`);

        if (apps.length === 0) {
            reply.status(404);
        }

        return apps;
    });

    fastify.post("/api/apps", {
        schema: {
            body: Joi.object().keys({ ...appSchema })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = fastify.redis;
        const { app_name } = request.body;
        await client.sadd("apps", app_name);

        reply.status(201);
    });

    fastify.delete("/api/apps/:app_name", {
        schema: {
            params: Joi.object().keys({ ...appSchema })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = fastify.redis;
        const { app_name } = request.params;

        // TODO: Multi, remove associated entities, tags etc.
        await client.srem("apps", app_name);

        reply.status(204);
    });
}

module.exports = routes;