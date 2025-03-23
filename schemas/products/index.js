const Joi = require("joi");

const eatenProductSchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": "Title is mandatory",
    "string.empty": "Title cannot be empty",
  }),
  weight: Joi.number().positive().required().messages({
    "number.base": "Weight must be a number",
    "number.positive": "Weight must be a positive number",
    "any.required": "Weight is mandatory",
  }),
});

module.exports = { eatenProductSchema };
