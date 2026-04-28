import * as yup from 'yup';

export const todoSchema = yup
  .object({
    text: yup.string().trim().min(1, 'Required').max(500, 'Too long').required(),
  })
  .noUnknown();

export const todoIdSchema = yup.string().uuid().required();
