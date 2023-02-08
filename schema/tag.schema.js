const Joi = require("joi");

const tagSchema = {
    app_name: Joi.string().alphanum().required().min(1),
    entity_name: Joi.string().alphanum().required().min(1),
    entity_id: Joi.number().required().min(1),
    tag_name: Joi.string().alphanum().required().min(1)
}

module.exports = { tagSchema }