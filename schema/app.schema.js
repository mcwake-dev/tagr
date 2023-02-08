const Joi = require("joi");

const appSchema = {
    app_name: Joi.string().alphanum().required().min(1)
};

module.exports = {
    appSchema
}