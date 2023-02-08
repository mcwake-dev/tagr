const Joi = require("joi");

const entitySchema = {
    entity_name: Joi.string().alphanum().required().min(1)
}

module.exports = {
    entitySchema
}