const Joi = require("joi");

const entityTagSchema = {
    entity_tag_name: Joi.string().alphanum().required().min(1)
}

module.exports = {
    entityTagSchema
}