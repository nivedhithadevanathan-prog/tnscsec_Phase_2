import Joi from "joi";

export const initForm10Schema = {
  body: Joi.object({}).unknown(false),
};

export const previewForm10Schema = {
  query: Joi.object({}).unknown(false),
};

export const rejectForm10Schema = {
  body: Joi.object({
    form10_id: Joi.number().integer().required(),

    form10_society_id: Joi.number().integer().required(),

    candidates: Joi.array()
      .items(
        Joi.object({
          form5_member_id: Joi.number().integer().required(),
          remarks: Joi.string().allow("", null),
        })
      )
      .min(1)
      .required(),
  }).unknown(false),
};

export const withdrawForm10Schema = {
  body: Joi.object({
    form10_id: Joi.number().integer().required(),

    form10_society_id: Joi.number().integer().required(),

    candidates: Joi.array()
      .items(
        Joi.object({
          form5_member_id: Joi.number().integer().required(),
          remarks: Joi.string().allow("", null),
        })
      )
      .min(1)
      .required(),
  }).unknown(false),
};

export const finalForm10Schema = {
  body: Joi.object({
    form10_id: Joi.number()
      .integer()
      .positive()
      .required(),

    form10_society_id: Joi.number()
      .integer()
      .positive()
      .required(),
  }).unknown(false),
};

export const submitForm10Schema = {
  body: Joi.object({
    form10_id: Joi.number()
      .integer()
      .positive()
      .required(),
  }).unknown(false),
};



export const listForm10Schema = {
  query: Joi.object({}).unknown(false),
};
