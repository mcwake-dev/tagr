// entity.routes.js

const Joi = require("joi");

const { validatorCompiler } = require("../utils/validatorCompiler.util");
const { appsKey } = require("../utils/keys.util");
const { appSchema } = require("../schema/app.schema");

/**
 * Encapsulates Entity routes
 * @param {FastifyInstance} fastify Fastify instance
 * @param {Object} options Plugin options
 */
async function routes(fastify, options) {
    fastify.get("/api/apps", async (request, reply) => {
        const client = fastify.redis;
        const apps = await client.smembers(appsKey());

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

        await client.sadd(appsKey(), app_name);

        reply.status(201);
    });

    fastify.delete("/api/apps/:app_name", {
        schema: {
            params: Joi.object().keys({ ...appSchema })
        }, validatorCompiler
    }, async (request, reply) => {
        const client = fastify.redis;
        const { app_name } = request.params;

        await client
            .multi()
            .srem(appsKey(), app_name)
            .del(appEntitiesKey(app_name), entity_name)
            .del(appEntityTagsKey(app_name, entity_name), entity_tag_name)
            .del(taggedWithKey(app_name, entity_name, tag_name))
            .exec();

        reply.status(204);
    });
}

module.exports = routes;